import { Platform } from "react-native";
import { api } from "./api";

export interface ExportDownloadResponse {
  data: Blob | ArrayBuffer;
  filename: string;
  contentType: string;
}

export interface ExportLinkResponse {
  url: string;
}

function getFilenameFromDisposition(header?: string) {
  if (!header) return undefined;
  const match = /filename="?([^";]+)"?/i.exec(header);
  return match?.[1];
}

function buildFilename(type?: string) {
  const date = new Date().toISOString().slice(0, 10);
  const label = type === "ca" ? "chiffre-affaires" : (type ?? "complet");
  return `export_${label}_${date}.xlsx`;
}

export const exportService = {
  async download(
    token: string,
    type?: "prospects" | "rdvs" | "notes" | "ca" | "objectifs",
  ): Promise<ExportDownloadResponse> {
    const response = await api.get("/v1/export/rgpd", {
      headers: { Authorization: `Bearer ${token}` },
      params: type ? { type } : undefined,
      responseType: Platform.OS === "web" ? "blob" : "arraybuffer",
    });

    const contentType =
      (response.headers?.["content-type"] as string) || "application/zip";
    const filename =
      getFilenameFromDisposition(
        response.headers?.["content-disposition"] as string,
      ) || buildFilename(type);

    return {
      data: response.data as Blob | ArrayBuffer,
      filename,
      contentType,
    };
  },

  async createMobileDownloadLink(
    token: string,
    type?: "prospects" | "rdvs" | "notes" | "ca" | "objectifs",
  ): Promise<ExportLinkResponse> {
    const response = await api.get<ExportLinkResponse>("/v1/export/rgpd/link", {
      headers: { Authorization: `Bearer ${token}` },
      params: type ? { type } : undefined,
    });
    return response.data;
  },
};
