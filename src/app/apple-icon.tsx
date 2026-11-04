import { ImageResponse } from "next/og";

// Ícono al agregar la app a la pantalla de inicio del iPhone (iOS redondea las esquinas).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#15171c",
          color: "#ffffff",
          fontSize: 112,
          fontWeight: 800,
        }}
      >
        $
      </div>
    ),
    size,
  );
}
