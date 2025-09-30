declare module 'expo-file-system' {
  export const documentDirectory: string | null;

    export function createDownloadResumable(url: string, fileUri: string) {
        throw new Error("Function not implemented.");
    }

  export function downloadAsync(url: string, fileUri: string) {
    throw new Error('Function not implemented.');
  }
}
