export function getIpfsAddress(hash: string) {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
  
export function handleImageUrl(url: string) {
    if (url.includes("https://gateway.pinata.cloud")) {
        return url;
    }
    return getIpfsAddress(url);
}