import { RiRobot2Fill } from "react-icons/ri";

const Footer = () => {
  return (
    <div className="bg-[#f3f3f3] flex justify-center px-4 pb-10 py-4 pt-10">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-sm border border-gray-200 py-8 px-3 text-center">
        <div className="flex justify-center items-center gap-3 mb-3">
          <div><RiRobot2Fill size={30} className="bg-black text-white p-2 rounded-lg"/></div>
          <h2 className="font-semibold">AI Interview Platform</h2>
        </div>
        <p className="text-gray-500 text-sm max-w-xl mx-auto">
          Prepare smarter, practice confidently, and take your interview skills to the next level with AI-powered insights and personalized feedback. Helping candidates practice, improve, and prepare for their next opportunity.
        </p>

        <div className="border border-gray-200 bg-gray-400  rounded-2xl mt-4 mb-2"></div>
        <div className="test-xs text-slate-400 justify-center">
          © {new Date().getFullYear()} AI Interview Platform
        </div>
      </div>
    </div>
  )
}

export default Footer