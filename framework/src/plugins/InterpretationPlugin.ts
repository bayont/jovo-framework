import { AsrData, InputTypeLike, NluData } from '@jovotech/common';
import { ParsedAudioInput } from '../audio/ParsedAudioInput';
import { InvalidParentError } from '../errors/InvalidParentError';
import { Extensible } from '../Extensible';
import { Jovo } from '../Jovo';
import { Platform } from '../Platform';
import { Plugin, PluginConfig } from '../Plugin';

export interface InterpretationPluginInputConfig {
  supportedTypes: InputTypeLike[];
}

export interface InterpretationPluginConfig extends PluginConfig {
  input: InterpretationPluginInputConfig;
}

// Provide basic functionality that will then be used by AsrPlugin, NluPlugin and SluPlugin
export abstract class InterpretationPlugin<
  CONFIG extends InterpretationPluginConfig = InterpretationPluginConfig,
> extends Plugin<CONFIG> {
  abstract readonly targetSampleRate?: number;
  abstract processAudio?(jovo: Jovo, audio: ParsedAudioInput): Promise<AsrData | undefined>;

  abstract processText?(jovo: Jovo, text: string): Promise<NluData | undefined>;

  mount(parent: Extensible): Promise<void> | void {
    if (!(parent instanceof Platform)) {
      throw new InvalidParentError(this.name, 'Platform');
    }
    if (this.processAudio) {
      parent.middlewareCollection.use('interpretation.asr', (jovo) => {
        return this.asr(jovo);
      });
    }
    if (this.processText) {
      parent.middlewareCollection.use('interpretation.nlu', (jovo) => {
        return this.nlu(jovo);
      });
    }
  }

  protected isInputTypeSupported(inputType: InputTypeLike): boolean {
    return this.config.input.supportedTypes.includes(inputType);
  }

  protected async asr(jovo: Jovo): Promise<void> {
    // if this plugin is not able to process audio, a text is already set, no audio is set or the input type is not supported, skip
    if (
      !this.processAudio ||
      jovo.$input.getText() ||
      !jovo.$input.audio ||
      !this.isInputTypeSupported(jovo.$input.type)
    ) {
      return;
    }
    const parsedAudioInput = ParsedAudioInput.fromAudioInput(jovo.$input.audio);
    if (this.targetSampleRate) {
      parsedAudioInput.sampleDown(this.targetSampleRate);
    }
    const asrProcessResult = await this.processAudio(jovo, parsedAudioInput);
    if (asrProcessResult) {
      jovo.$input.asr = asrProcessResult;
    }
  }

  protected async nlu(jovo: Jovo): Promise<void> {
    const text = jovo.$input.getText();
    // if this plugin is not able to process text, no text exists or the input type is not supported, skip
    if (!this.processText || !text || !this.isInputTypeSupported(jovo.$input.type)) {
      return;
    }
    const nluProcessResult = await this.processText(jovo, text);
    if (nluProcessResult) {
      jovo.$input.nlu = nluProcessResult;
      jovo.$entities = nluProcessResult.entities || {};
    }
  }
}
