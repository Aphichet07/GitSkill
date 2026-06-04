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

    // ─── 1. สกัดและจัดการข้อมูล (Data Preparation) ───
    const languages = skills
      .filter((s) => s.category === "Language")
      .map((s) => s.skill_name)
      .join(", ");

    // ป้องกันกรณีข้อความยาวเกินไปจนทำให้เปลือง Token หรือ API Error
    const safeReadme = readmeContent ? readmeContent.substring(0, 3000) : "ไม่มีข้อมูล README";
    const safeDeps = projectDependencies ? projectDependencies.substring(0, 500) : "ไม่ระบุ";

    const nestedLoops = projectAnalysis.detailed_stats?.nestedLoopsO2 || 0;
    const leftoverLogs = projectAnalysis.detailed_stats?.leftoverLogs || 0;
    const docScore = projectAnalysis.doc_score || 0;
    const cleanScore = projectAnalysis.clean_code_score || 0;

    // ─── 2. ควบคุมเงื่อนไขด้วย Code เพื่อความแม่นยำ 100% ───
    const hasRisks = nestedLoops > 0 || leftoverLogs > 0;
    const closingInstruction = hasRisks
      ? `4. ประโยคปิดท้าย: ให้เขียนข้อเสนอแนะเชิงบวกว่า "อย่างไรก็ตาม หากเพิ่มความรัดกุมในเรื่องมาตรฐานความพร้อมก่อนขึ้นระบบจริง (Production-readiness) และการยกระดับประสิทธิภาพอัลกอริทึมเพื่อรองรับการขยายตัว (Algorithmic Scalability) อีกเล็กน้อย จะทำให้เป็นวิศวกรที่สมบูรณ์แบบยิ่งขึ้น" (ห้ามใช้คำว่า ลูป, Big O, หรือ Log โดยเด็ดขาด)`
      : `4. ไม่ต้องมีประโยคปิดท้ายเชิงเสนอแนะ (ให้จบที่ประโยคที่สามได้เลย)`;

    // ─── 3. สร้าง Prompt ───
    const prompt = `
      คุณคือ Tech Lead ที่ต้องเขียนสรุปศักยภาพแคนดิเดตให้ CTO ประเมิน
      
      [ข้อมูลทางเทคนิค]
      - เทคโนโลยีหลัก: ${languages || "ไม่ระบุ"}, ${safeDeps}
      - สิ่งที่โปรเจกต์ทำ: ${safeReadme}
      - ตัวชี้วัด: Clean Code ${cleanScore}/15, Documentation ${docScore}/10
      - จุดที่ต้องระวัง: Time Complexity ${nestedLoops} จุด, ร่องรอยการ Debug ตกค้าง ${leftoverLogs} จุด

      [กฎการเขียน - บังคับใช้อย่างเคร่งครัด]
      เขียนเป็นความเรียง 1 ย่อหน้าเท่านั้น (ความยาว 3-4 ประโยค) ห้ามใช้ Bullet point และใช้ภาษาที่ทรงพลัง เป็นมืออาชีพแบบผู้บริหารระดับสูงคุยกัน

      [โครงสร้างเนื้อหาบังคับ - ต้องเขียนตามลำดับนี้]
      1. เปิดประโยคแรกด้วย "แคนดิเดตมีสถาปัตยกรรมทางความคิดและมาตรฐานการเขียนโค้ด..." แล้วอธิบายเชิงบวกว่าเขาวางโครงสร้างระบบอย่างไร (พิจารณาจากเทคโนโลยีที่ใช้) ซึ่งส่งผลดีต่อความเสถียรหรือการรองรับผู้ใช้งานอย่างไร
      2. ประโยคที่สอง พูดถึงคุณภาพโค้ดและการพัฒนาระบบที่ซับซ้อน (ดึงฟีเจอร์เด่นๆ จากข้อมูลโปรเจกต์มาอธิบายสั้นๆ)
      3. ประโยคที่สาม เปิดประโยคด้วย "สิ่งที่ทำให้แคนดิเดตคนนี้แตกต่างและมีมูลค่าสูงต่อองค์กรคือ..." จากนั้นให้เลือกจุดแข็งที่สุดมาเน้นย้ำ (เช่น วุฒิภาวะในการทำเอกสาร, การจัดการสถาปัตยกรรมที่ยืดหยุ่น, หรือความปลอดภัย)
      ${closingInstruction}

      ห้ามเกริ่นนำ พิมพ์เฉพาะเนื้อหาสรุปมาได้เลย
    `;

    // ─── 4. เรียกใช้งาน Gemini API ───
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
    
  } catch (error) {
    console.error("❌ AI Generation Error:", error);
    return null;
  }
};