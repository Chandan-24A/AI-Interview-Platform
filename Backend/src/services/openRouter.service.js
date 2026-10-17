import axios from 'axios'

async function askAi(messages){

    try{

        if(!messages || !Array.isArray(messages) || messages.length === 0){
            throw new Error("Messages array is empty.");
        }

        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions",
            {
                model: 'nvidia/nemotron-3-super-120b-a12b:free',
                messages:messages,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            },
        );

        const content = response?.data?.choices?.[0]?.message?.content;

        if(!content || !content.trim()){
            throw new Error("AI Returned an empty response.");
        }

        return content;

    }catch(error){
        console.error("OpenRouter Error:",error.response?.data || error.message)
        throw new Error("OpenRouter Api Error")
    }
}

export {askAi};