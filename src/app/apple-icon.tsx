import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

/** Apple touch icon matching icon.svg and ArgentMark, sized for iOS / Safari / iMessage. */
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
          background: "linear-gradient(180deg, #34353A 0%, #1B1C1F 100%)",
        }}
      >
        <svg
          width="144"
          height="144"
          viewBox="112 112 800 800"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#B45A26"
            d="M505 212H324A112 112 0 0 0 212 324V700A112 112 0 0 0 324 812H505Z"
          />
          <path
            fill="#DEDFE1"
            d="M519 212H700A112 112 0 0 1 812 324V700A112 112 0 0 1 700 812H519V684A172 172 0 0 0 519 340Z"
          />
          <path fill="#F2B27A" d="M505 340A172 172 0 0 0 505 684Z" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
