import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { useQueryClient } from "@tanstack/react-query";
import { INewUer, IUser } from "@/types/user.type";
import { useAccount } from "wagmi";
import {
  useLoginWithEmail,
  User,
  LinkedAccountWithMetadata,
  PrivyErrorCode,
  usePrivy,
} from "@privy-io/react-auth";
import { toast } from "sonner";
import { Dropzone } from "../ui/dropzone";
import { useForm, FormProvider } from "react-hook-form";
import { handleImageUrl } from '@/helpers/image';

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: IUser | null | undefined;
  sendOtp?: boolean;
}

type DialogStep = "details" | "otp";

export const UpdateProfileModal = ({
  isOpen,
  onClose,
  currentUser,
  sendOtp = false,
}: UpdateProfileModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("")
  const [code, setCode] = useState("");
  const [step, setStep] = useState<DialogStep>("details");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarHash, setAvatarHash] = useState<string>("");
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  const { mutateAsync: updateUser } =
    useUpdateUser();
  const queryClient = useQueryClient();
  const { address: accountAddress } = useAccount();
  const {user: privyUser} = usePrivy()

  // Setup react-hook-form
  const methods = useForm({
    defaultValues: {
      profilePhoto: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      setName(currentUser?.fullName || "");
      setEmail(currentUser?.email || privyUser?.email?.address || "");
      setUsername(currentUser?.username || "")
      setCode("");
      setStep("details");
      setAvatarFile(null);
      setAvatarHash(currentUser?.avatar || "");
    }
  }, [isOpen, currentUser, privyUser, sendOtp]);

  const {
    sendCode,
    loginWithCode,
    state: privyLoginState,
  } = useLoginWithEmail({
    onComplete: async (params: {
      user: User;
      isNewUser: boolean;
      wasAlreadyAuthenticated: boolean;
      loginMethod: any | null;
      loginAccount: LinkedAccountWithMetadata | null;
    }) => {
      console.log(
        "Privy: Email verified for",
        params.user.email?.address,
        "Is new to Privy:",
        params.isNewUser
      );
      try {
        setIsUpdatingUser(true);
        const updatePayload: INewUer = {
          username: username.trim(),
          fullName: name.trim(),
          email: email.trim(),
          avatar: avatarHash || currentUser?.avatar || undefined,
          newUser: !currentUser?.email,
        };
        await updateUser(updatePayload);

        const queryAddress = currentUser?.walletAddress || accountAddress;
        if (queryAddress) {
          await queryClient.invalidateQueries({
            queryKey: ["user", queryAddress],
          });
        }
        setIsUpdatingUser(false);
        resetAndClose();
      } catch (error) {
        console.error(
          "Failed to update profile after Privy verification:",
          error
        );
        toast.error("Failed to update your profile. Please try again.");
      }
    },
    onError: (error: PrivyErrorCode) => {
      console.error("Privy login error code:", error);
      let errorMessage = `Privy verification failed. Error: ${error}`;
      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    if (privyLoginState.status === "awaiting-code-input") {
      setStep("otp");
    }
  }, [privyLoginState.status]);

  const handleDrop = (name: string, file: File, ipfsHash: string) => {
    setAvatarFile(file);
    setAvatarHash(handleImageUrl(ipfsHash));
  };

  const handleSendVerificationCode = async () => {
    if (name.trim() && email.trim() && email.includes("@")) {
      try {
        setIsUpdatingUser(true);
        
        // If user already has an email (signed in with email via Privy) or sendOtp is false, 
        // skip OTP verification and directly update profile
        const userAlreadyHasEmail =  currentUser?.email || privyUser?.email;
        const shouldSkipOtp = !sendOtp || userAlreadyHasEmail;
        
        if (shouldSkipOtp) {
          const updatePayload: INewUer = {
            fullName: name.trim(),
            email: email.trim(),
            avatar: avatarHash || currentUser?.avatar || undefined,
            username: username.trim(),
            newUser: !currentUser?.email,
          };
          await updateUser(updatePayload);
        
          const queryAddress = currentUser?.walletAddress || accountAddress;
          if (queryAddress) {
            await queryClient.invalidateQueries({
              queryKey: ["user", queryAddress],
            });
          }
          setIsUpdatingUser(false);
          toast.success("Profile updated successfully!");
          resetAndClose();
        } else {
          await sendCode({ email: email.trim() });
        }
      } catch (error: any) {
        console.error("Failed to send verification code:", error);
        toast.error(
          error.message ||
            "Failed to send verification code. Check email and try again."
        );
      }
    } else {
      toast.error("Please enter a valid name and email address.");
    }
  };

  const handleVerifyOtpAndSave = async () => {
    if (code.trim().length === 6) {
      try {
        await loginWithCode({ code: code.trim() });
      } catch (error: any) {
        console.error("Failed to verify OTP:", error);
        toast.error(
          error.message || "Failed to verify OTP. Check code and try again."
        );
      }
    } else {
      toast.error("Please enter a valid 6-digit verification code.");
    }
  };

  const resetAndClose = () => {
    setName("");
    setUsername("");
    setEmail("");
    setCode("");
    setStep("details");
    setAvatarFile(null);
    setAvatarHash("");
    sendOtp = false;
    methods.reset();
    onClose();
  };

  const isLoading =
    privyLoginState.status === "sending-code" ||
    privyLoginState.status === "submitting-code" ||
    isUpdatingUser;
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetAndClose();
      }}
    >
      <DialogContent className="sm:max-w-lg p-0 bg-neutral-900 rounded-[24px] w-full max-h-[90vh] flex flex-col">
        <FormProvider {...methods}>
          <div className="p-6 flex-1 overflow-y-auto scrollbar-hide">
            <DialogHeader>
            <DialogTitle>
              {step === "details" ? "Update Your Profile" : "Verify Your Email"}
            </DialogTitle>
            <DialogDescription>
              {step === "details"
                ? currentUser?.email 
                  ? "Please enter your name and email to update your profile."
                  : "Please enter your name and email. We'll send a code to verify your email."
                : `Enter the 6-digit code sent to ${email}.`}
            </DialogDescription>
          </DialogHeader>

          {step === "details" && (
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                <label htmlFor="name">Username</label>
                <Input
                  id="username"
                  placeholder="Your Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="col-span-4  rounded-xl border border-neutral-700 focus:ring-peach-400 focus:border-peach-400 outline-none"
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="name">Name</label>
                <Input
                  id="name"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-4  rounded-xl border border-neutral-700 focus:ring-peach-400 focus:border-peach-400 outline-none"
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="col-span-4  border border-neutral-700 focus:ring-peach-400 focus:border-peach-400 outline-none"
                  disabled={isLoading}
                />
              </div>

             {
              (!sendOtp || currentUser?.email) && (
                <div className="grid gap-2">
                <label htmlFor="avatar">Profile Photo</label>
                <div className="w-full">
                  <Dropzone name="profilePhoto" onDrop={handleDrop} />
                </div>
              </div>
              )
             }
            </div>
          )}

          {step === "otp" && (
            <div className="grid gap-4 py-4 items-center justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(value) => setCode(value)}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot
                    index={0}
                    className="border border-neutral-700 focus:ring-peach-400 focus:border-peach-400 outline-none"
                  />
                  <InputOTPSlot
                    index={1}
                    className="border border-neutral-700 focus:ring-peach-400 focus:border-peach-400 outline-none"
                  />
                  <InputOTPSlot
                    index={2}
                    className="border border-neutral-700 focus:ring-peach-400 focus:border-peach-400 outline-none"
                  />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot
                    index={3}
                    className="border border-neutral-700 focus:ring-peach-400 focus:border-peach-400 outline-none"
                  />
                  <InputOTPSlot
                    index={4}
                    className="border border-neutral-700 focus:ring-peach-400 focus:border-peach-400 outline-none"
                  />
                  <InputOTPSlot
                    index={5}
                    className="border border-neutral-700 focus:ring-peach-400 focus:border-peach-400 outline-none"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>
          )}
          </div>

          <DialogFooter className="gap-2 sm:justify-between p-6 border-t border-neutral-800">
            {step === "otp" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("details");
                  setCode("");
                }}
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="ghost"
                onClick={resetAndClose}
                disabled={isLoading && step === "otp"}
              >
                Cancel
              </Button>
              {step === "details" && (
                <Button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={isLoading || !name.trim() || !email.includes("@")}
                  loading={isLoading || isUpdatingUser}
                  loadingText={isUpdatingUser ? "Updating..." : "Processing..."}
                  className="bg-peach-400 hover:bg-peach-300 text-black rounded-full"
                >
                  {(!sendOtp || currentUser?.email || privyUser?.email) ? "Update" : "Send Code"}
                </Button>
              )}
              {step === "otp" && (
                <Button
                  type="button"
                  onClick={handleVerifyOtpAndSave}
                  disabled={isLoading || code.length !== 6}
                  loading={isLoading || isUpdatingUser}
                  loadingText={isUpdatingUser ? "Saving..." : "Verifying..."}
                  className="bg-peach-400 hover:bg-peach-300 text-black rounded-full"
                >
                  Verify & Save
                </Button>
              )}
            </div>
          </DialogFooter>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
