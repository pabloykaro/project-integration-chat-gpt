import { Spinner } from "phosphor-react";
import { ChangeEvent, useState } from "react";

function App() {
  const [message, setMessage] = useState<string[]>([]);
  const [ask, setAsk] = useState<string>("");
  const [statusRequest, setStatusRequest] = useState<boolean>(false);

  async function consumerGptAPI() {
    try {
      const API_CHAT_GPT = import.meta.env.VITE_API_CHAT_GPT;
      setStatusRequest(true);
      const requestAPIChatGPT = await fetch(
        "https://api.openai.com/v1/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_CHAT_GPT}`,
          },
          body: JSON.stringify({
            model: "text-davinci-003",
            prompt: `${ask}. formato o texto com quebras de linhas por paragrafos gerado no texto.`,
            top_p: 1,
            max_tokens: 500,
            temperature: 0.22,
            frequency_penalty: 0,
            presence_penalty: 0,
          }),
        }
      );
      const reader = requestAPIChatGPT.body;
      return reader;
    } catch (err) {
      console.warn(err);
    } finally {
      setStatusRequest(false);
    }
  }

  function transformationLayerData() {
    let bufferData = "";
    return new TransformStream({
      transform(chunk, controller) {
        const data = JSON.parse(chunk).choices[0].text;
        bufferData += data;
        const items = bufferData.split("\n");

        items.slice(0, -1).forEach((item) => controller.enqueue(item));

        bufferData = items[items.length - 1];
      },
      flush(controller) {
        if (!bufferData) return;
        controller.enqueue(bufferData);
      },
    });
  }
  function defineTheMessagesReceived() {
    return new WritableStream({
      write: (data) => {
        setMessage((messageOld) => [...messageOld, data]);
      },
    });
  }

  function autoResizeMessage(textarea: HTMLTextAreaElement) {
    if (textarea.value.trim() === "") {
      textarea.style.height = "auto";
      return;
    }
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  function validateInputEnter() {
    if (!ask) return true;
    if (statusRequest) return true;
    return false;
  }

  async function handledSearch() {
    if (ask.trim() === "") return;
    const readableResponse = await consumerGptAPI();
    readableResponse
      ?.pipeThrough(new TextDecoderStream())
      .pipeThrough(transformationLayerData())
      .pipeTo(defineTheMessagesReceived());
  }
  return (
    <div className="flex flex-col gap-10 items-center w-screen h-screen">
      <article
        aria-describedby="response-data"
        className="flex flex-col mt-10  gap-1 max-w-2xl w-full flex-wrap text-left"
      >
        {statusRequest ? (
          <div aria-label="Aguardando resposta" className="m-auto p-auto">
            <Spinner className="animate-spin" color="#000000" size={32} />
          </div>
        ) : (
          <h1 className="m-auto mb-10 p-auto font-bold text-3xl">
            Conte conosco para tirar suas dúvidas
          </h1>
        )}
        {message.map((response, index) => {
          return (
            <span className="text-black" key={index + 1}>
              {response}
            </span>
          );
        })}
      </article>
      <main className="flex flex-col  p-4 rounded bg-card-background items-center gap-5 w-full max-w-2xl ">
        <textarea
          className="w-full p-4  resize-none  ring-1 ring-highlight hover:ring-2 text-black bg-card-background outline-none rounded"
          placeholder="Digite à sua pergunta"
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
            setAsk(e.target.value);
            autoResizeMessage(e.target);
          }}
        />
        <button
          disabled={validateInputEnter()}
          className="w-full ring-2 ring-highlight disabled:cursor-not-allowed  text-black   h-10 rounded font-bold  hover:bg-highlight focus:bg-highlight"
          onClick={handledSearch}
        >
          Enviar
        </button>
      </main>
    </div>
  );
}

export default App;
