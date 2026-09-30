import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

const DIR = `${FileSystem.documentDirectory}proof/`;

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
}

async function keep(uri: string): Promise<string> {
  await ensureDir();
  const dest = `${DIR}${Date.now()}.jpg`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

// Lets the player attach a photo as proof. Returns a persistent local path, or null if they cancel.
export async function pickProofPhoto(fromCamera: boolean): Promise<string | null> {
  const perm = fromCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const result = fromCamera
    ? await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true, aspect: [4, 3], base64: true })
    : await ImagePicker.launchImageLibraryAsync({ quality: 0.6, allowsEditing: true, aspect: [4, 3], base64: true });

  const asset = result.assets?.[0];
  if (result.canceled || !asset?.uri) return null;
  if (Platform.OS === 'web') {
    return asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null;
  }
  return keep(asset.uri);
}

export async function readProofPhotoBase64(uri: string): Promise<string> {
  if (uri.startsWith('data:')) return uri.slice(uri.indexOf(',') + 1);
  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}
