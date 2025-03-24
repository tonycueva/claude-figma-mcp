/// <reference path="../node_modules/@figma/plugin-typings/index.d.ts" />

// Define specific enum types for Figma API
declare namespace FigmaTypes {
    // Transition types for prototyping
    type TransitionType = 'DISSOLVE' | 'SMART_ANIMATE' | 'PUSH' | 'SLIDE_IN' | 'SLIDE_OUT' | 'INSTANT' | 'SCROLL_ANIMATE' | 'MOVE_IN' | 'MOVE_OUT';
    
    // Trigger types for interactions
    type TriggerType = 'HOVER' | 'MOUSE_DOWN' | 'MOUSE_UP' | 'DRAG' | 'CLICK';
  }