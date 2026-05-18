import Image from "next/image";
import Code from "@/asset/code.png";
import Stat from "@/asset/stat.png";
import analysis from "@/asset/ChatGPT Image May 18, 2026, 10_19_48 PM.png";

function WorksCompo() {
  return (
    <div className="relative min-h-screen w-full px-20 pt-25 bg-white">
      <div className="flex items-center justify-center">
        <h4 className="font-bold text-[#3F1A84] text-4xl mb-4">How It Work</h4>
      </div>

     <div className="flex flex-col items-center justify-center">
                    {/* center title */}
                    {/* two column layout   */}
                    <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full max-w-4xl lg:max-w-6xl px-2 md:px-4">
                        {/* left side */}
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="space-y-6">
                                <section>
                                    <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-[#3F1A84] ">
                                        How to create a project?
                                    </h1>
                                    <p className="text-sm md:text-base leading-relaxed text-[#3F1A84] ">
                                        Start by clicking "Create Project" and then enter a name for your project. This will take you to the editor where you can start building your flow.
                                    </p>
                                </section>
                            </div>
                        </div>

                        {/* right side*/}
                        <div className="flex-1 flex items-center justify-center">
                            <Image
                                src={Stat}
                                alt="Help Illustration"
                                width={300}
                                height={300}
                                className="object-contain w-48 md:w-96"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full max-w-4xl lg:max-w-6xl px-2 md:px-4 mt-8 md:mt-12">
                        {/* left side */}
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="space-y-6">
                                <section>
                                    <Image
                                src={analysis}
                                alt="Help Illustration"
                                width={400}
                                height={400}
                                className="object-contain"
                            />
                                </section>
                            </div>
                        </div>

                        {/* right side*/}
                        <div className="flex-1 flex flex-col justify-center">
                            <h1 className="text-3xl font-semibold mb-2 text-[#3F1A84] ">
                                        How to delete my old project?
                                    </h1>
                                    <p className="text-base leading-relaxed text-[#3F1A84] ">
                                        To delete a project, go to the project list and click on the delete icon next to the project you want to delete. Please note that this action is irreversible.
                                    </p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full max-w-4xl lg:max-w-6xl px-2 md:px-4">
                        {/* left side*/}
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="space-y-6">
                                <section>
                                    <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-[#3F1A84] ">
                                    How to edit my project?
                                    </h1>
                                    <p className="text-sm md:text-base leading-relaxed text-[#3F1A84] ">
                                        To edit a project, simply click on the project card from your project list. This will take you to the editor where you can make changes to your flow. Remember to save your changes before exiting the editor.
                                    </p>
                                </section>
                            </div>
                        </div>

                        {/* right side*/}
                        <div className="flex-1 flex items-center justify-center">
                            <Image
                                src={Code}
                                alt="Help Illustration"
                                width={300}
                                height={300}  
                                className="object-contain w-48 md:w-96"
                            />
                        </div>
                    </div>
                </div>
    </div>
  );
}

export default WorksCompo;