import { useState } from "react";
import axios from "axios";
import CodeReviewModal from "./CodeReviewModal";

const API = "http://localhost:5000/api";

export default function CodeGeneratorModal({ task, onClose }) {

  const token = localStorage.getItem("token");

  const [loading,setLoading]=useState(false);
  const [files,setFiles]=useState([]);
  const [reviewFile,setReviewFile]=useState(null);

  const generate = async()=>{

    try{

      setLoading(true);

      const res=await axios.post(

        `${API}/ai/chat`,

        {

          projectId:task.project,

          message:`
Generate production-ready code for this task.

Title:
${task.title}

Description:
${task.description}

Acceptance Criteria:
${task.acceptanceCriteria?.join("\n")}
`

        },

        {

          headers:{
            Authorization:`Bearer ${token}`
          }

        }

      );

      setFiles(res.data.files||[]);

    }

    catch(err){

      console.log(err);

      alert("Generation failed");

    }

    finally{

      setLoading(false);

    }

  };

  const copy=(code)=>{

    navigator.clipboard.writeText(code);

    alert("Copied");

  };

  return(

<>

<div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">

<div className="bg-[#161b22] w-[1000px] h-[720px] rounded-xl p-6 overflow-auto">

<div className="flex justify-between mb-6">

<h1 className="text-2xl text-white font-bold">

🤖 AI Code Generator

</h1>

<button onClick={onClose}>✕</button>

</div>

<button

onClick={generate}

disabled={loading}

className="bg-purple-700 px-5 py-3 rounded mb-6"

>

{loading?"Generating...":"Generate Code"}

</button>

{files.map((file,index)=>(

<div

key={index}

className="border border-gray-700 rounded-xl mb-8"

>

<div className="flex justify-between items-center bg-[#21262d] px-5 py-4">

<div>

<h2 className="text-green-400 font-bold">

{file.filename}

</h2>

<p className="text-gray-400">

{file.description}

</p>

</div>

<div className="flex gap-3">

<button

onClick={()=>copy(file.code)}

className="bg-blue-600 px-4 py-2 rounded"

>

Copy

</button>

<button

onClick={()=>setReviewFile(file)}

className="bg-yellow-600 px-4 py-2 rounded"

>

Review

</button>

</div>

</div>

<pre className="bg-black text-green-400 p-5 whitespace-pre-wrap overflow-auto">

{file.code}

</pre>

</div>

))}

</div>

</div>

{reviewFile&&(

<CodeReviewModal

file={reviewFile}

onClose={()=>setReviewFile(null)}

/>

)}

</>

  );

}