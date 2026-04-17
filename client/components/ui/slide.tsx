import Arrow from "@/asset/arrow-down.png";
import Image from "next/image";

function Slide() {
  return (
    <div className="flex items-center justify-center border border-gray-600 rounded-full w-7 h-10 animate-bounce">
      <Image
        src={Arrow}
        alt="arrow"
        width={20}
        height={15}
        className="object-contain"
      />
    </div>
  );
}

export default Slide;