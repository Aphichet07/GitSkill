import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const generateAIInsight = async (
  projectAnalysis: any,
  skills: any[],
  readmeContent: string,
  projectDependencies: string,
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const languages = skills
      .filter((s) => s.category === "Language")
      .map((s) => s.skill_name)
      .join(", ");

    const safeReadme = readmeContent ? readmeContent.substring(0, 3000) : "ไม่มีข้อมูล README";
    const nestedLoops = projectAnalysis.detailed_stats?.nestedLoopsO2 || 0;
    const leftoverLogs = projectAnalysis.detailed_stats?.leftoverLogs || 0;
    const docScore = projectAnalysis.doc_score || 0;

    const prompt = `
      คุณคือ Tech Lead ที่ต้องเขียนสรุปศักยภาพแคนดิเดตให้ CTO ประเมิน
      
      [ข้อมูลทางเทคนิค]
      - เทคโนโลยีหลัก: ${languages}, ${projectDependencies}
      - สิ่งที่โปรเจกต์ทำ: ${safeReadme}
      - ตัวชี้วัด: Clean Code ${projectAnalysis.clean_code_score}/15, Documentation ${docScore}/10, จุดเสี่ยงด้าน Time Complexity ${nestedLoops} จุด, ร่องรอยการ Debug ตกค้าง ${leftoverLogs} จุด

      [กฎการเขียน - บังคับใช้อย่างเคร่งครัด]
      เขียนเป็นความเรียง 1 ย่อหน้าเท่านั้น (ไม่เกิน 4 ประโยค) ห้ามใช้ Bullet point และใช้ภาษาที่ทรงพลัง เป็นมืออาชีพแบบผู้บริหารระดับสูงคุยกัน

      [โครงสร้างเนื้อหาบังคับ - ต้องเขียนตามลำดับนี้]
      1. เปิดประโยคแรกด้วย "แคนดิเดตมีสถาปัตยกรรมทางความคิดและมาตรฐานการเขียนโค้ด..." แล้วอธิบายเชิงบวกว่าเขาวางโครงสร้างระบบอย่างไร (พิจารณาจากเทคโนโลยีที่ใช้) ซึ่งส่งผลดีต่อความเสถียรหรือการรองรับผู้ใช้งานอย่างไร
      2. ประโยคที่สอง พูดถึงคุณภาพโค้ดและการพัฒนาระบบที่ซับซ้อน (ดึงฟีเจอร์เด่นๆ จาก README มาอธิบาย)
      3. ประโยคที่สาม เปิดประโยคด้วย "สิ่งที่ทำให้แคนดิเดตคนนี้แตกต่างและมีมูลค่าสูงต่อองค์กรคือ..." จากนั้นให้เลือกจุดแข็งที่สุดมาเน้นย้ำ (เช่น วุฒิภาวะในการทำเอกสาร, การจัดการสถาปัตยกรรมที่ยืดหยุ่น, หรือความปลอดภัย)
      4. ประโยคปิดท้าย (ข้อเสนอแนะเชิงวิศวกรรม): หากมีจุดเสี่ยง (${nestedLoops} > 0 หรือ ${leftoverLogs} > 0) "ห้ามใช้คำว่า ลูป, Big O, หรือ Log โดยเด็ดขาด" แต่ให้แนบคำแนะนำเชิงบวกว่า "อย่างไรก็ตาม หากเพิ่มความรัดกุมในเรื่องมาตรฐานความพร้อมก่อนขึ้นระบบจริง (Production-readiness) และการยกระดับประสิทธิภาพอัลกอริทึมเพื่อรองรับการขยายตัว (Algorithmic Scalability) อีกเล็กน้อย จะทำให้เป็นวิศวกรที่สมบูรณ์แบบยิ่งขึ้น" (ถ้าไม่มีจุดเสี่ยง ไม่ต้องเขียนประโยคนี้)

      ห้ามเกริ่นนำ พิมพ์เนื้อหาสรุปมาได้เลย
    `;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("❌ AI Generation Error:", error);
    return null;
  }
};
