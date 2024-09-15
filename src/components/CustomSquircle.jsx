/* eslint-disable react/prop-types */
import { Button } from "@nextui-org/react";

export default function CustomSquircle({
  iconSrc,
  altText,
  onClick,
  label,
  customStyle = {},
}) {
  return (
    <div className="flex flex-col items-center">
      <Button
        auto
        light
        onClick={onClick}
        css={{
          width: "48px",
          height: "48px",
          background: "none",
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
          padding: "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...customStyle,
        }}
        style={{
          width: "48px",
          height: "48px",
          background: "none",
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
          padding: "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...customStyle,
        }}
      >
        <img src={iconSrc} alt={altText} width={24} height={24} />
      </Button>
      <span className="text-sm text-gray-300 mt-2">{label}</span>
    </div>
  );
}

/** Alternative approach 
 * import Image from "next/image";

export default function CustomSquircle({
  iconSrc,
  altText,
  onClick,
  label,
  customStyle = {}, // Add support for custom styles
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        onClick={onClick}
        style={{
          width: "48px",
          height: "48px",
          background: "none",
          borderRadius: "12px", // Rounded square
          border: "1px solid #E5E7EB", // default light gray border
          padding: "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer", // Add cursor pointer for better UX
          ...customStyle, // Apply custom styles if provided
        }}
      >
        <Image src={iconSrc} alt={altText} width={24} height={24} />
      </div>
      <span className="text-sm text-gray-300 mt-2">{label}</span>
    </div>
  );
}

 */
