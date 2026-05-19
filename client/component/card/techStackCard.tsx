"use client";

function TechStackCard() {
  return (
    <div className="bg-white rounded-[16px] shadow-sm border border-gray-200 w-27.5 h-27.5 flex flex-col items-center justify-center gap-2">
     
      <div className="flex items-center justify-center">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/960px-Python-logo-notext.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail"
          alt="Python"
          className="w-12 h-12 object-contain"
        />
      </div>
      <span className="text-sm font-medium text-gray-700">Python</span>
    </div>
  );
}

export default TechStackCard;
