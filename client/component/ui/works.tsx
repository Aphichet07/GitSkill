import Image from "next/image";
import Code from "@/asset/code.png";
import Stat from "@/asset/stat.png"

function WorksCompo() {
  return (
    <div className="relative min-h-screen w-full px-20 pt-25 bg-white">
      <div className="flex items-center justify-center">
        <h4 className="font-bold text-[#3F1A84] text-4xl">How It Work</h4>
      </div>

      <div className="max-w-8xl pt-10">
        <div className="flex items-center justify-between">
          <div className="">
            <Image
              src={Code}
              alt="code"
              width={400}
              height={400}
              className="object-cover"
            />
          </div>
          <div className="bg-[linear-gradient(to_right,#322854,#3F1A84,#4739C4,#3140B3)] rounded-[10px] w-40 h-12">
            <div className="flex items-center justify-center pt-2">
                <h2 className="font-blod text-white text-xl">GITSKILL</h2>
            </div>
          </div>

          <div className="">
            <Image src={Stat} alt="stat" width={400} height={400} className="object-cover"/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorksCompo;