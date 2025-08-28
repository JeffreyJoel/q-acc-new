export function getIpfsAddress(hash: string) {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
  
export function handleImageUrl(url: string) {
    if (url.includes("https://gateway.pinata.cloud")) {
        return url;
    }
   else if (url.includes("https://images.mirror-media.xyz/publication-images/")) {
        return url;
    }
    return getIpfsAddress(url);
}