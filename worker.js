import { pipeline } from '@xenova/transformers';

class MyTranslationPipeline {
  static task = 'translation';
  static model = 'Xenova/nllb-200-distilled-600M';
  // static model = 'facebook/nllb-200-distilled-600M';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}

self.addEventListener('message', async (event) => {
  // Retrieve translation pipeline when called for first time,
  // this will load pipeline and save it for future use
  let translator = await MyTranslationPipeline.getInstance((x) => {
    // we also add progress callback to the pipeline so that we can
    // track model loading
    self.postMessage(x);
  });

  // Actually perform translation
  let output = await translator(event.data.text, {
    tgt_lang: event.data.tgt_lang,
    src_lang: event.data.src_lang,

    // Allows for partial output
    // callback_function: (x) => {
    //   self.postMessage({
    //     status: 'update',
    //     output: translator.tokenizer.decode(x[0].output_token_ids, {
    //       skip_special_tokens: true,
    //     }),
    //   });
    // },
  });

  // Send the output back to the main thread
  self.postMessage({
    status: 'complete',
    output: output,
    input: event.data.text,
    order: event.data.order,
  });
});
