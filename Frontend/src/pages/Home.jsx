import { useSelector } from "react-redux"
import Navbar from "../components/Navbar.jsx"
import { RiRobot2Fill } from 'react-icons/ri'
import { BsMic,BsClock,BsBarChart,BsFileEarmarkText } from 'react-icons/bs'
import { HiSparkles } from "react-icons/hi"
import { motion } from "motion/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import AuthModel from "../components/AuthModel.jsx"
import hrImg from "../assets/HR.png"
import techImg from "../assets/tech.png"
import evalImg from "../assets/ai-ans.png"
import resumeImg from "../assets/resume.png"
import pdfImg from "../assets/pdf.png"
import historyImg from "../assets/history.png"
import Footer from "../components/Footer.jsx"

const Home = () => {
  
  const {userData} = useSelector((state)=>state.user)
  const [showAuth,setShowAuth] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col">
      <Navbar/>

      <div className="flex-1 px-6 py-20">
        <div className="max-w-6xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 text-gray-600 text-md px-4 py-2 rounded-full flex items-center gap-2">
            <HiSparkles size={16} className="bg-green-50 text-green-600 "/>
            AI Powered Smart Interview Platform
          </div>
        </div>

        <div className="text-center mb-28">
          <motion.h1
          initial={{ opacity:0, y:30 }}
          animate={{ opacity:1 , y:0 }} 
          transition={{duration:0.6}}
          className="text-4xl md:text-6xl font-semibold leading-tight max-w-4xl mx-auto">
            Practice Interviews with
            <span className="relative inline-block mt-5">
              <span className="bg-green-100 text-green-600 px-5 py-1 rounded-full">
                AI Intelligence
              </span>
            </span>
          </motion.h1>

          <motion.p 
          initial={{opacity:0}}
          animate={{opacity:1}}
          transition={{duration:0.8}}
          className="text-gray-500 mt-8 max-w-2xl mx-auto text-lg">
            Role based mock interviews with smart follow-ups,adaptive difficulty and real-time performance evaluation.
          </motion.p>

          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <motion.button 
            onClick={()=>{
              if(!userData){
                setShowAuth(true)
                return;
              }
              navigate("/interview")
            }}
            whileHover={{opacity:0.9 , scale:1.03}}
            whileTap={{opacity:1,scale:0.97}}
            transition={{duration:0.2}}
            className="bg-black text-white px-10 py-3 rounded-full hover:opacity-10 transition shadow-md">
              Start Interview
            </motion.button>

            <motion.button 
            onClick={()=>{
              if(!userData){
                setShowAuth(true)
                return;
              }
              navigate("/history")
            }}
            whileHover={{opacity:0.9 , scale:1.03}}
            whileTap={{opacity:1,scale:0.97}}
            transition={{duration:0.2}}
            className="border border-gray-300 px-10 py-3 rounded-full hover:bg-gray-100 transition">
              View History
            </motion.button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center gap-15 mb-28">
          {
            [
              {
                icon:<RiRobot2Fill size={24}/>,
                step: "STEP 1",
                title: "Role and Experience Selection",
                des:  "AI adjusts difficulty based on  selected job roles"
              },
              {
                icon:<BsMic size={24}/>,
                step: "STEP 2",
                title: "Smart Voice Interview",
                des:  "Dynamic Follow up questions based on your answer"
              },
              {
                icon:<BsClock size={24}/>,
                step: "STEP 3",
                title: "TImer based simulation",
                des:  "Real Interview pressure with time tracking"
              }
            ].map((item,index)=>(
              <motion.div 
              initial={{opacity:0 , y:60}}
              animate={{opacity:1 , y:0}}
              transition={{duration:0.6 + index*0.2}}
              whileHover={{rotate:0 , scale:1.06}}

              key={index} className={`relative bg-white rounded-3xl border-2 border-green-100 hover:border-green-500 p-10 w-80 max-w-[90%] shadow-md hover:shadow-2xl
              transition-all duration-300
              ${index === 0 ? "rotate-[-4deg]": ""}
              ${index === 1 ? "rotate-3 md:mt-6 sha-xl" : ""}
              ${index === 2 ? "-rotate-3" : ""}
              `}
              >

              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white border-2 border-green-500 text-green-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                {item.icon}
              </div>
              <div className="p-10 text-center">
                <div className="text-xs text-green-600 font-semibold mb-2 tracking-wider">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-3 text-lg">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.des}
                </p>
              </div>
                
              </motion.div>
            ))
          }
        </div>
        <div className="mb-32">
          <motion.h2 
          initial={{opacity:0,y:20}}
          whileInView={{opacity:1 , y:0}}
          transition={{duration:0.6}}
          className="text-4xl font-semibold text-center mb-16">
            Advanced AI{" "}
            <span className="text-green-600">Capabilities</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-10">
            {
              [
                {
                  image:evalImg,
                  icon:<BsBarChart size={20}/>,
                  title: "Ai Answer Evaluation",
                  des: "Scores communication,technical accuracy and confidence"
                },
                {
                  image:resumeImg,
                  icon:<BsFileEarmarkText size={20}/>,
                  title: "Rsume Based Interview",
                  des: "Project Specific questions based on resume uploaded and Job description"
                },
                {
                  image:pdfImg,
                  icon:<BsFileEarmarkText size={20}/>,
                  title: "Downloadable PDF report",
                  des: "Detailed Strengths,weaknesses and improvement insights"
                },
                {
                  image:historyImg,
                  icon:<BsBarChart size={20}/>,
                  title: "History and Analytics",
                  des: "Track Progress with Performance Graphs and topic analytics"
                },
              ].map((item,index)=>(
                <motion.div
                initial={{opacity:0,y:30}}
                animate={{opacity:1,y:0}}
                transition={{duration:0.5 , delay:index*0.2}}
                whileHover={{scale:1.02}}
                 key={index} className="bg-white border-b-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-full md:w-1/2 flex justify-center">
                      <img src={item.image} alt={item.title} className="w-full h-auto object-contain max-h-64"/>
                    </div>

                    <div className="w-full md:w-1/2">
                      <div className="bg-green-50 text-green-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                        {item.icon}
                      </div>
                      <h3 className="font-semibold mb-3 text-xl">{item.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.des}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            }
          </div>
        </div>

        <div className="mb-32">
          <motion.h2 
          initial={{opacity:0,y:20}}
          whileInView={{opacity:1 , y:0}}
          transition={{duration:0.6}}
          className="text-4xl font-semibold text-center mb-16">
            Multiple InterView{" "}
            <span className="text-green-600">Modes</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-10">
            {
              [
                {
                  image:hrImg,  
                  title: "HR Interview Mode",
                  des: "Behaviural and communication based evaluation"
                },
                {
                  image:techImg,
                  title: "Technical Mode",
                  des: "Fundamental and Diverse technical questions based on selected role"
                },
              ].map((item,index)=>(
                <motion.div
                initial={{opacity:0,y:30}}
                animate={{opacity:1,y:0}}
                transition={{duration:0.5 , delay:index*0.2}}
                whileHover={{y:-6}}
                 key={index} className="bg-white border-b-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-full md:w-1/2 flex justify-center">
                      <img src={item.image} alt={item.title} className="w-full h-auto object-contain max-h-64"/>
                    </div>

                    <div className="w-full md:w-1/2">
                      <h3 className="font-semibold mb-3 text-xl">{item.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.des}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            }
          </div>
        </div>
      </div>
      </div>
      {showAuth && <AuthModel onClose={()=>{setShowAuth(false)}}/>}

      <Footer/>
    </div>

    
  )
}

export default Home