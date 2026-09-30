import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[char];
  });
}

function certificateHtml(name: string, goal: string, date: string) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
@page{size:A4 landscape;margin:0}*{box-sizing:border-box}body{margin:0;background:#eef2f2;color:#172d38;font-family:Georgia,'Times New Roman',serif}.sheet{width:297mm;height:210mm;padding:16mm;background:#f9faf7;display:grid;place-items:center}.frame{width:100%;height:100%;border:2px solid #bd8c47;padding:14mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.brand{font:600 14px Arial,sans-serif;letter-spacing:4px;text-transform:uppercase;color:#426878}.title{font-size:42px;font-weight:normal;margin:16px 0;color:#203b49}.line{font:16px Arial,sans-serif;color:#52666c}.name{font-size:38px;margin:14px 0 20px;color:#a46d2d}.goal{font-size:22px;max-width:230mm;line-height:1.4;margin:12px auto 26px}.meta{font:14px Arial,sans-serif;color:#52666c}.rule{width:90mm;border-top:1px solid #bd8c47;margin:10px 0 14px}
</style></head><body><main class="sheet"><section class="frame"><div class="brand">Hatua</div><h1 class="title">Certificate of Completion</h1><div class="line">This recognizes the effort and progress of</div><div class="name">${escapeHtml(name)}</div><div class="line">for completing the goal</div><div class="goal">${escapeHtml(goal)}</div><div class="rule"></div><div class="meta">Completed ${escapeHtml(date)}</div></section></main></body></html>`;
}

export async function saveCertificate(name: string, goal: string, completedAt: number) {
  const date = new Date(completedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const html = certificateHtml(name.trim() || 'Goal Achiever', goal, date);

  if (Platform.OS === 'web') {
    const popup = window.open('', '_blank');
    if (!popup) throw new Error('Allow pop-ups to print your certificate.');
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    window.setTimeout(() => popup.print(), 300);
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  if (!(await Sharing.isAvailableAsync())) throw new Error('File sharing is unavailable on this device.');
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Save your Hatua certificate',
    UTI: 'com.adobe.pdf',
  });
}