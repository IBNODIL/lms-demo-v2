import Mux from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env.MUX_ACCESS_TOKEN,
  tokenSecret: process.env.MUX_SECRET_KEY,
});

export async function createMuxUpload(
  fileName: string,
  courseId: string,
  chapterId: string
) {
  try {
    const upload = await mux.video.uploads.create({
      cors_origin: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
      new_asset_settings: {
        playback_policy: ["public"],
        encoding_tier: "baseline",
      },
    });

    return {
      uploadUrl: upload.url,
      uploadId: upload.id,
    };
  } catch (error) {
    console.error("MUX Upload Error:", error);
    throw error;
  }
}

export async function getMuxPlaybackInfo(assetId: string) {
  try {
    const asset = await mux.video.assets.retrieve(assetId);
    return {
      playbackId: asset.playback_ids?.[0]?.id,
      status: asset.status,
      duration: asset.duration,
    };
  } catch (error) {
    console.error("MUX Playback Error:", error);
    throw error;
  }
}

export async function getMuxAsset(assetId: string) {
  try {
    const asset = await mux.video.assets.retrieve(assetId);
    return asset;
  } catch (error) {
    console.error("MUX Asset Error:", error);
    throw error;
  }
}
