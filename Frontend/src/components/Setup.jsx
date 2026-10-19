import { motion } from "motion/react"
import { useState } from "react"
import { FaUserTie,FaBriefcase,FaFileUpload,FaMicrophoneAlt,FaChartLine } from "react-icons/fa"
import axios from "axios"
import { serverUrl } from "../App.jsx"

const Setup = ({onStart}) => {
    const [role,setRole] = useState("")
    const [experience,setExperience] = useState("")
    const [mode,setMode] = useState("Technical")
    const [resumeFile,setResumeFile] = useState(null)
    const [loading,setLoading] = useState(false)
    const [projects,setProjects] = useState([])
    const [skills,setSkills] = useState([])
    const [resumeText,setResumeText] = useState("")
    const [analysisIsDone,setAnalysisIsDone] = useState(false)
    const [analyzing,setAnalyzing] = useState(false)

    const handleResumeUpload = async () => {
        if(!resumeFile || analyzing) return;

        setAnalyzing(true)

        const formdata = new FormData()

        formdata.append("resume",resumeFile);

        try{
            const result = await axios.post(serverUrl + "/api/interview/resume",formdata,{withCredentials:true})

            console.log(result.data)

            setRole(result.data.role || "")
            setExperience(result.data.experience || "")
            setProjects(Array.isArray(result.data.projects) ? result.data.projects : [])
            setSkills(Array.isArray(result.data.skills) ? result.data.skills : [])
            setResumeText(result.data.resumeText || "")
            setAnalysisIsDone(true)

            setAnalyzing(false)
        }catch (error){
            console.log(error)
            setAnalyzing(false)
        }
    }

    const handleStart = async () =>{
        setLoading(true)

        try{
            const result = await axios.post(serverUrl + "/api/interview/generate-questions",{role,experience,mode,resumeText,projects,skills},{withCredentials:true})
            console.log(result)

            setLoading(false);
            onStart(result.data)

        }catch(error){
            console.log(error);
            setLoading(false)
        }
    }
    
  return (
    <motion.div
    initial={{opacity:0}}
    animate={{opacity:1}}
    transition={{duration:0.6}}
     className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200 px-4">

        <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden">
            <motion.div 
            initial={{x:-80,opacity:0}}
            animate={{x:0,opacity:1}}
            transition={{duration:0.7}}
            className="relative bg-linear-to-br from-green-50 to-green-100 p-12 flex flex-col justify-center">
                
                <h2 className="text-4xl font-bold text-gray-800 mb-6">
                    Start Your AI Interview
                </h2>

                <p className="text-gray-600 mb-10">
                    Experience AI-powered mock interviews, sharpen your technical expertise, enhance your communication skills, and build the confidence to succeed in real interviews.
                </p>

                <div className="space-y-5">
                    {
                        [
                            {
                                icon: <FaUserTie className="text-green-600 text-xl"/>,
                                text: "Choose Role and Experience",
                            },
                            {
                                icon: <FaMicrophoneAlt className="text-green-600 text-xl"/>,
                                text: "Smart Voice Interview",
                            },
                            {
                                icon: <FaChartLine className="text-green-600 text-xl"/>,
                                text: "Perfromance Analytics"
                            }
                        ].map((item,index)=>(
                            <motion.div 
                            initial={{opacity:0,y:30}}
                            animate={{opacity:1,y:0}}
                            transition={{delay:0.3 + index*0.15}}
                            whileHover={{scale:1.03}}
                            key={index} className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm cursor-pointer">
                                {item.icon}
                                <span className="text-gray-700 font-medium">{item.text}</span>
                            </motion.div>
                        ))
                    }
                </div>
            </motion.div>

            <motion.div
            initial={{x:80,opacity:0}}
            animate={{x:0,opacity:1}}
            transition={{duration:0.7}}
             className="p-12 bg-white">
                <h2 className="text-3xl font-bold text-gray-800 mb-8">
                    Interview SetUp
                </h2>       
                <div className="space-y-6">
                    <div className="relative">
                        <FaUserTie className="absolute top-1.5 left-4 text-gray-400"/>
                        <input type="text" className="w-full pl-12 pr-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition" placeholder="Enter Role" onChange={(e)=>setRole(e.target.value)} value={role}/>
                    </div>

                    <div className="relative">
                        <FaBriefcase className="absolute top-1.5 left-4 text-gray-400"/>
                        <input type="text" className="w-full pl-12 pr-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition" placeholder="Experience (e.g 2 Years)" onChange={(e)=>setExperience(e.target.value)} value={experience}/>

                    </div>

                    <select 
                        onChange={(e)=>setMode(e.target.value)}
                        value={mode} className="w-full py-2 x-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition font-normal text-gray-500">

                            <option value="Technical" className="font-normal">Technical Interview</option>
                            <option value="HR" className="font-normal">HR Interview</option>
                    </select>
                    
                    {!analysisIsDone && (
                        <motion.div
                        whileHover={{scale:1.02}}
                        onClick={()=>document.getElementById("resumeUpload").click()}
                         className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition mt-4">
                            <FaFileUpload className="text-4xl mx-auto text-green-600"/>
                            
                            <input type="file" accept="application/pdf" id="resumeUpload" className="hidden"
                            onChange={(e)=>setResumeFile(e.target.files[0])}
                            />
                            <p className="text-gray-600 font-medium">
                                {resumeFile ? resumeFile.name : "Click to Upload resume(Optional)"}
                            </p>

                            {resumeFile && (
                                <motion.button
                                whileHover={{scale:1.02}}
                                onClick={(e)=>{
                                    e.stopPropagation();
                                    handleResumeUpload();
                                }}
                                 className="mt-4 bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition">
                                
                                {analyzing ? "Analyzing..." : "Analyze Resume"}
                                </motion.button>
                            )}
                        </motion.div>
                    )}

                    {analysisIsDone && (
                        <motion.div
                        initial={{opacity:0,y:30}}
                        animate={{opacity:1,y:0}}
                         className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                            <h3 className="text-base font-semibold text-gray-800">
                                Resume Analysis Result
                            </h3>
                            {projects.length >0 && (
                                <div>
                                    <p className="mb-1 font-medium text-gray-700">Projects:</p>

                                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                                        {projects.map((p,i)=>(
                                            <li key={i}>{p}</li>
                                        ))}
                                    </ul>
                                </div>

                            )}

                            {skills.length >0 && (
                                <div>
                                    <p className="mb-1 font-medium text-gray-700">Skills:</p>

                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((s,i)=>(
                                            <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">{s}</span>
                                        ))}
                                    </div>
                                </div>

                            )}
                        </motion.div>
                    )}

                    <motion.button
                    onClick={handleStart}
                    disabled={!role || !experience || loading}
                    whileHover={{scale:1.03}}
                    whileTap={{scale:0.93}}
                     className="w-full disabled:bg-gray-600 bg-green-600 hover:bg-green-700 text-white py-3 rounded-full text-lg font-semibold transition duration-300 shadow-md">
                        {loading? "Starting...": "Start Interview"}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    </motion.div>
  )
}

export default Setup