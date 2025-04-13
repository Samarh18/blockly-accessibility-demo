/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';

/**
 * A simple screen reader implementation for Blockly that announces actions.
 */
export class ScreenReader {
  private workspace: Blockly.WorkspaceSvg;
  
  /**
   * Constructs a new ScreenReader instance.
   * @param workspace The Blockly workspace to attach to.
   */
  constructor(workspace: Blockly.WorkspaceSvg) {
    this.workspace = workspace;
    this.initEventListeners();
    
    // Announce that screen reader is active
    this.speak("Screen reader enabled");
  }
  
  /**
   * Initialize event listeners for workspace changes.
   */
  private initEventListeners(): void {
    // Listen for block selection changes
    this.workspace.addChangeListener((event: Blockly.Events.Abstract) => {
      if (event.type === Blockly.Events.SELECTED) {
        const selectedEvent = event as Blockly.Events.Selected;
        if (selectedEvent.newElementId) {
          const block = this.workspace.getBlockById(selectedEvent.newElementId);
          if (block) {
            this.announceBlock(block);
          }
        } else {
          this.speak("No block selected");
        }
      } else if (event.type === Blockly.Events.BLOCK_CREATE) {
        const createEvent = event as Blockly.Events.BlockCreate;
        if (createEvent.blockId) {
          const block = this.workspace.getBlockById(createEvent.blockId);
          if (block) {
            this.speak(`${this.getBlockDescription(block)} added to the workspace`);
          }
        }
      } else if (event.type === Blockly.Events.BLOCK_DELETE) {
        this.speak("Block deleted");
      } else if (event.type === Blockly.Events.BLOCK_CHANGE) {
        const changeEvent = event as Blockly.Events.BlockChange;
        if (changeEvent.blockId) {
          const block = this.workspace.getBlockById(changeEvent.blockId);
          if (block) {
            this.speak(`Changed ${this.getBlockDescription(block)}`);
          }
        }
      }
    });
  }
  
  /**
   * Announce information about a specific block.
   * @param block The block to announce.
   */
  public announceBlock(block: Blockly.Block): void {
    const description = this.getBlockDescription(block);
    this.speak(`Selected ${description}`);
  }
  
  /**
   * Get a human-readable description of a block.
   * @param block The block to describe.
   * @returns A description string.
   */
  private getBlockDescription(block: Blockly.Block): string {
    // Get the type of the block
    const blockType = block.type;
    
    // For certain block types, provide more specific descriptions
    if (blockType === 'p5_setup') {
      return "Setup block";
    } else if (blockType === 'p5_draw') {
      return "Draw block";
    } else if (blockType === 'p5_canvas') {
      const width = block.getFieldValue('WIDTH');
      const height = block.getFieldValue('HEIGHT');
      return `Create Canvas with width ${width} and height ${height}`;
    } else if (blockType === 'math_number') {
      const value = block.getFieldValue('NUM');
      return `Number block with value ${value}`;
    } else if (blockType === 'text_print') {
      return "Print text block";
    } 
    // New and enhanced descriptions
    else if (blockType === 'draw_emoji') {
      const emoji = block.getFieldValue('emoji');
      let emojiName = "emoji";
      if (emoji === '❤️') emojiName = "heart";
      else if (emoji === '✨') emojiName = "sparkle";
      else if (emoji === '🐻') emojiName = "bear";
      return `Draw ${emojiName}`;
    } else if (blockType === 'simple_circle') {
      // Try to get the color from the connected color block
      let colorName = "colored";
      
      try {
        const colorInput = block.getInput('COLOR');
        if (colorInput && colorInput.connection && colorInput.connection.targetBlock()) {
          const colorBlock = colorInput.connection.targetBlock();
          if (colorBlock && colorBlock.type === 'colour_picker') {
            const colorHex = colorBlock.getFieldValue('COLOUR');
            colorName = this.getColorNameFromHex(colorHex);
          }
        }
      } catch (e) {
        console.log("Error getting circle color:", e);
      }
      
      return `Draw ${colorName} circle`;
    } else if (blockType === 'p5_background_color') {
      // Try to get the color from the connected color block
      let colorName = "selected";
      
      try {
        const colorInput = block.getInput('COLOR');
        if (colorInput && colorInput.connection && colorInput.connection.targetBlock()) {
          const colorBlock = colorInput.connection.targetBlock();
          if (colorBlock && colorBlock.type === 'colour_picker') {
            const colorHex = colorBlock.getFieldValue('COLOUR');
            colorName = this.getColorNameFromHex(colorHex);
          }
        }
      } catch (e) {
        console.log("Error getting background color:", e);
      }
      
      return `Set background color to ${colorName}`;
    } else if (blockType === 'write_text_without_shadow') {
      const text = block.getFieldValue('TEXT');
      return `Write text "${text}" without shadow`;
    } else if (blockType === 'write_text_with_shadow') {
      // Try to determine the text content
      let textContent = "selected text";
      
      try {
        const textInput = block.getInput('TEXT');
        if (textInput && textInput.connection && textInput.connection.targetBlock()) {
          const textBlock = textInput.connection.targetBlock();
          if (textBlock && (textBlock.type === 'text' || textBlock.type === 'text_only')) {
            textContent = textBlock.getFieldValue('TEXT');
          }
        }
      } catch (e) {
        console.log("Error getting shadow text:", e);
      }
      
      return `Write text "${textContent}" with shadow`;
    } else if (blockType === 'colour_random') {
      return "Generate random color";
    } else if (blockType === 'colour_picker') {
      const colorHex = block.getFieldValue('COLOUR');
      const colorName = this.getColorNameFromHex(colorHex);
      return `Color: ${colorName}`;
    }
    
    // Default description based on block type
    const readableType = blockType.replace(/_/g, ' ');
    return readableType + " block";
  }
  
  // Convert hex color to a name
  private getColorNameFromHex(hexColor: string): string {
    // Remove # if present
    hexColor = hexColor.replace('#', '').toLowerCase();
    
    // Extended color mapping
    const colorMap: {[key: string]: string} = {
      'ff0000': 'red',
      'ff4500': 'orange-red',
      'ffa500': 'orange',
      'ffff00': 'yellow',
      'adff2f': 'green-yellow',
      '00ff00': 'green',
      '008000': 'dark green',
      '00ffff': 'cyan',
      '0000ff': 'blue',
      '000080': 'navy blue',
      '4b0082': 'indigo',
      '800080': 'purple',
      '9400d3': 'dark violet',
      'ff00ff': 'magenta',
      'ff1493': 'deep pink',
      'ffffff': 'white',
      '000000': 'black',
      'c0c0c0': 'silver',
      '808080': 'gray',
      'a52a2a': 'brown',
      'f0e68c': 'khaki',
      'd2b48c': 'tan',
      '9932cc': 'dark orchid',
      '98fb98': 'pale green',
      'dda0dd': 'plum',
      'f5f5dc': 'beige',
      'ffe4c4': 'bisque',
      'ffc0cb': 'pink'
    };
    
    // Check if the hex color is in our map
    if (colorMap[hexColor]) {
      return colorMap[hexColor];
    }
    
    // For unknown colors, try to categorize them by their components
    try {
      // Parse the hex color into RGB components
      const r = parseInt(hexColor.substr(0, 2), 16);
      const g = parseInt(hexColor.substr(2, 2), 16);
      const b = parseInt(hexColor.substr(4, 2), 16);
      
      // Check which component is dominant
      if (r > g && r > b) {
        if (g > b) return r - g > 50 ? 'reddish orange' : 'orange red';
        return r - b > 50 ? 'bright red' : 'reddish purple';
      } else if (g > r && g > b) {
        if (r > b) return g - r > 50 ? 'yellowish green' : 'yellow green';
        return g - b > 50 ? 'bright green' : 'greenish blue';
      } else if (b > r && b > g) {
        if (r > g) return b - r > 50 ? 'bluish purple' : 'purple blue';
        return b - g > 50 ? 'bright blue' : 'teal blue';
      } else if (r === g && g === b) {
        // Grayscale
        if (r > 200) return 'light gray';
        if (r > 100) return 'gray';
        return 'dark gray';
      }
    } catch (e) {
      console.log("Error parsing color:", e);
    }
    
    // If all else fails
    return 'custom color';
  }
  
  /**
   * Speak a message out loud using the browser's speech synthesis.
   * @param message The message to speak.
   */
  private speak(message: string): void {
    // Log to console for debugging
    console.log(`Screen reader: ${message}`);
    
    // Use the Web Speech API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.speak(utterance);
    }
  }
}