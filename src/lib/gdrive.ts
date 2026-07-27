import { google } from "googleapis";
import { Readable } from "stream";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

function getDriveService() {
  const credentialsString = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsString) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS environment variable is not set");
  }

  // Check if it's a file path or JSON string
  let auth;
  if (credentialsString.endsWith(".json")) {
    // We assume it's a path if it ends with .json
    auth = new google.auth.GoogleAuth({
      keyFile: credentialsString,
      scopes: SCOPES,
    });
  } else {
    // If it's a JSON string, parse it
    try {
      const credentials = JSON.parse(credentialsString);
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: SCOPES,
      });
    } catch (e) {
      throw new Error("GOOGLE_APPLICATION_CREDENTIALS must be a valid JSON string or path to a JSON file");
    }
  }

  return google.drive({ version: "v3", auth });
}

export async function uploadFileToDrive(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
  const drive = getDriveService();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID environment variable is not set");
  }

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  // Convert Buffer to a Readable stream
  const media = {
    mimeType: mimeType,
    body: Readable.from(fileBuffer),
  };

  try {
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });

    return file.data.id as string;
  } catch (error) {
    console.error("Error uploading to Google Drive:", error);
    throw new Error("Failed to upload file to Google Drive");
  }
}
