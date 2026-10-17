import fs from "fs"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"
import { askAi } from "../services/openRouter.service.js";

async function analyzeResume(req,res){
    try{
        if(!req.file){
            return res.status(400).json({ message: "Resume Required" });
        }

        const filePath = req.file.path;
        
        const fileBuffer = await fs.promises.readFile(filePath);

        const uint8Array = new Uint8Array(fileBuffer);

        const pdf = await pdfjsLib.getDocument({data:uint8Array}).promise;

        let resumeText = "";

        // Extract all text from the pages of the pdf

        for(let pagenum = 1;pagenum<=pdf.numPages;pagenum++){
            const page = await pdf.getPage(pagenum);
            const content = await page.getTextContent();

            const pageContent = content.items.map(item => item.str).join(" ");

            resumeText += pageContent + "\n";
        }

        resumeText = resumeText.replace(/\s+/g," ").trim(); 

        //Resume Parse prompt

        const messages = [
        {
            role: "system",
            content: `
            Extract structured data from resume.

            Return strictly JSON:

            {
                "role": "string",
                "experience": "string",
                "projects": ["project1", "project2"],
                "skills": ["skill1", "skill2"]
            }
            `
        },
        {
            role: "user",
            content: resumeText
        }
        ];

        const aiResponse = await askAi(messages);

        let cleanedResponse = aiResponse.trim();
        const jsonStart = cleanedResponse.indexOf("{");
        const jsonEnd = cleanedResponse.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd !== -1) {
            cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
        }

        const parsedRes = JSON.parse(cleanedResponse);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Delete the file after the resume is parsed successfully
        }

        res.json({
            role:parsedRes.role,
            experience:parsedRes.experience,
            projects:parsedRes.projects,
            skills:parsedRes.skills,
            resumeText
        });

    }catch(error){
        console.log(error);

        if(req.file && fs.existsSync(req.file.path)){
            fs.unlinkSync(req.file.path)
        }

        return res.status(500).json( {message:error.message} );
    }
}

export default analyzeResume;