// This is the code that runs in the Figma environment
// code.ts

// Establish connection with the MCP server
let ws: WebSocket | null = null;
let connected = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

// In a production environment, this would be configured in the plugin settings
// or read from a configuration service
const SERVER_URL = 'ws://localhost:8080';
const BACKUP_SERVER_URL = 'ws://127.0.0.1:8080';

// Note: You can update this URL if your MCP server is running on a different port
// For production, this would point to your hosted MCP server


// Connect to the MCP server
function connect(useBackupUrl = false) {
  try {
    connectionAttempts++;
    const url = useBackupUrl ? BACKUP_SERVER_URL : SERVER_URL;
    console.log(`Attempting to connect to MCP server at ${url} (attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS})`);
    ws = new WebSocket(url);
    
    ws.onopen = () => {
      connected = true;
      console.log('Connected to MCP server');
      figma.notify('Connected to MCP server');
      
      // Notify the UI about the connection
      figma.ui.postMessage({ type: 'connected' });
    };
    
    ws.onclose = (event) => {
      connected = false;
      console.log(`Disconnected from MCP server. Code: ${event.code}, Reason: ${event.reason}`);
      figma.notify(`Disconnected from MCP server. Code: ${event.code}`, { error: true });
      
      // Notify the UI about the disconnection
      figma.ui.postMessage({ 
        type: 'disconnected',
        code: event.code,
        reason: event.reason
      });
      
      // Try to reconnect with backup URL if this was the first attempt
      if (connectionAttempts === 1) {
        console.log('Trying backup URL...');
        figma.notify('Trying backup server address...');
        setTimeout(() => connect(true), 1000);
      }
      // Otherwise try to reconnect after a delay, but only up to MAX_CONNECTION_ATTEMPTS
      else if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
        setTimeout(() => connect(useBackupUrl), 5000);
      } else {
        console.log('Max connection attempts reached. Please check if the MCP server is running.');
        figma.notify('Failed to connect to MCP server after multiple attempts. Please check if the server is running.', { error: true, timeout: 10000 });
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      figma.notify('Error connecting to MCP server. Check console for details.', { error: true });
      
      // Notify the UI about the error
      figma.ui.postMessage({ 
        type: 'log',
        level: 'error',
        message: `WebSocket error: Connection failed to ${useBackupUrl ? BACKUP_SERVER_URL : SERVER_URL}`
      });
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received message from MCP server:', message);
        
        // Process the command from the MCP server
        processCommand(message);
      } catch (error) {
        console.error('Error processing message:', error);
        figma.notify('Error processing message from MCP server', { error: true });
      }
    };
  } catch (error) {
    console.error('Error connecting to MCP server:', error);
    figma.notify('Error connecting to MCP server', { error: true });
    
    // Try to reconnect with backup URL if this was the first attempt
    if (connectionAttempts === 1) {
      console.log('Trying backup URL...');
      figma.notify('Trying backup server address...');
      setTimeout(() => connect(true), 1000);
    }
    // Otherwise try to reconnect after a delay, but only up to MAX_CONNECTION_ATTEMPTS
    else if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      setTimeout(() => connect(useBackupUrl), 5000);
    } else {
      console.log('Max connection attempts reached. Please check if the MCP server is running.');
      figma.notify('Failed to connect to MCP server after multiple attempts. Please check if the server is running.', { error: true, timeout: 10000 });
    }
  }
}

// Send response back to the MCP server
function sendResponse(id: string, data: any) {
  if (ws && connected) {
    ws.send(JSON.stringify({
      id,
      ...data
    }));
  }
}

// Process commands received from the MCP server
async function processCommand(message: { id: string, command: string, params: any }) {
  const { id, command, params } = message;
  
  try {
    switch (command) {
      case 'createProject':
        await handleCreateProject(id, params);
        break;
        
      case 'createFrame':
        await handleCreateFrame(id, params);
        break;
        
      case 'createRectangle':
        await handleCreateRectangle(id, params);
        break;
        
      case 'createText':
        await handleCreateText(id, params);
        break;
        
      case 'createComponent':
        await handleCreateComponent(id, params);
        break;
        
      case 'createLayout':
        await handleCreateLayout(id, params);
        break;
        
      case 'createInteraction':
        await handleCreateInteraction(id, params);
        break;
        
      case 'exportFrame':
        await handleExportFrame(id, params);
        break;
        
      case 'exportCurrentFrame':
        await handleExportCurrentFrame(id, params);
        break;
        
      case 'generatePrototype':
        await handleGeneratePrototype(id, params);
        break;
        
      default:
        sendResponse(id, {
          error: `Unknown command: ${command}`
        });
    }
  } catch (err) {
    const error = err as Error;
    console.error(`Error processing command ${command}:`, error);
    sendResponse(id, {
      error: error.message || 'Unknown error'
    });
  }
}

// Command handlers

async function handleCreateProject(id: string, params: { name: string, description?: string }) {
  // In Figma, we don't directly create "projects" as they're a higher-level concept
  // Instead, we can create a page that represents the project
  
  // Create a new page for the project
  const page = figma.createPage();
  page.name = params.name;
  
  // Set the current page to the new project page
  figma.currentPage = page;
  
  // If description is provided, add it as a text node
  if (params.description) {
    const textNode = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    textNode.characters = `Description: ${params.description}`;
    textNode.x = 50;
    textNode.y = 50;
  }
  
  sendResponse(id, {
    projectId: page.id,
    success: true
  });
}

async function handleCreateFrame(id: string, params: { 
  name: string, 
  width: number, 
  height: number, 
  type: string 
}) {
  // Create a new frame
  const frame = figma.createFrame();
  frame.name = params.name;
  frame.resize(params.width, params.height);
  frame.x = 0;
  frame.y = 0;
  
  // Set the current selection to the new frame
  figma.currentPage.selection = [frame];
  figma.viewport.scrollAndZoomIntoView([frame]);
  
  sendResponse(id, {
    frameId: frame.id,
    width: frame.width,
    height: frame.height,
    success: true
  });
}

async function handleCreateRectangle(id: string, params: {
  x: number,
  y: number,
  width: number,
  height: number,
  fillColor?: string,
  cornerRadius?: number,
  name?: string
}) {
  // Create rectangle
  const rect = figma.createRectangle();
  rect.x = params.x;
  rect.y = params.y;
  rect.resize(params.width, params.height);
  
  // Set name if provided
  if (params.name) {
    rect.name = params.name;
  }
  
  // Set fill color if provided
  if (params.fillColor) {
    const color = hexToRgb(params.fillColor);
    if (color) {
      rect.fills = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b } }];
    }
  }
  
  // Set corner radius if provided
  if (params.cornerRadius !== undefined && params.cornerRadius > 0) {
    rect.cornerRadius = params.cornerRadius;
  }
  
  sendResponse(id, {
    nodeId: rect.id,
    success: true
  });
}

async function handleCreateText(id: string, params: {
  x: number,
  y: number,
  text: string,
  fontSize?: number,
  fontName?: string,
  color?: string,
  name?: string
}) {
  // Create text node
  const textNode = figma.createText();
  textNode.x = params.x;
  textNode.y = params.y;
  
  // Load font
  const fontName = params.fontName || "Inter";
  try {
    await figma.loadFontAsync({ family: fontName, style: "Regular" });
  } catch (error) {
    console.error(`Failed to load font ${fontName}, falling back to Inter`);
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  }
  
  // Set text content
  textNode.characters = params.text;
  
  // Set font size if provided
  if (params.fontSize) {
    textNode.fontSize = params.fontSize;
  }
  
  // Set color if provided
  if (params.color) {
    const color = hexToRgb(params.color);
    if (color) {
      textNode.fills = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b } }];
    }
  }
  
  // Set name if provided
  if (params.name) {
    textNode.name = params.name;
  }
  
  sendResponse(id, {
    nodeId: textNode.id,
    success: true
  });
}

async function handleCreateComponent(id: string, params: {
  type: string,
  x: number,
  y: number,
  width?: number,
  height?: number,
  text?: string,
  variant?: string,
  name?: string
}) {
  const elementIds: string[] = [];
  
  switch (params.type) {
    case 'Button': {
      const width = params.width || 120;
      const height = params.height || 40;
      
      // Create button background
      const rect = figma.createRectangle();
      rect.x = params.x;
      rect.y = params.y;
      rect.resize(width, height);
      rect.cornerRadius = 4;
      
      // Set color based on variant
      if (params.variant === 'secondary') {
        rect.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
      } else {
        // Primary button by default
        rect.fills = [{ type: 'SOLID', color: { r: 0.12, g: 0.53, b: 0.9 } }];
      }
      
      // Create button text
      const textNode = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Medium" });
      textNode.characters = params.text || 'Button';
      textNode.fontSize = 14;
      
      // Center text in button
      textNode.x = params.x + (width - textNode.width) / 2;
      textNode.y = params.y + (height - textNode.height) / 2;
      
      // Set text color
      if (params.variant === 'secondary') {
        textNode.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
      } else {
        textNode.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      }
      
      // Group the elements
      const group = figma.group([rect, textNode], figma.currentPage);
      group.name = params.name || 'Button';
      
      elementIds.push(group.id);
      
      sendResponse(id, {
        nodeId: group.id,
        success: true
      });
      break;
    }
    
    case 'Input': {
      const width = params.width || 240;
      const height = params.height || 40;
      
      // Create input background
      const rect = figma.createRectangle();
      rect.x = params.x;
      rect.y = params.y;
      rect.resize(width, height);
      rect.cornerRadius = 4;
      rect.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.97 } }];
      rect.strokes = [{ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 } }];
      rect.strokeWeight = 1;
      
      // Create placeholder text
      const textNode = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      textNode.characters = params.text || 'Placeholder text';
      textNode.fontSize = 14;
      textNode.x = params.x + 10;
      textNode.y = params.y + (height - textNode.height) / 2;
      textNode.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
      
      // Group the elements
      const group = figma.group([rect, textNode], figma.currentPage);
      group.name = params.name || 'Input Field';
      
      elementIds.push(group.id);
      
      sendResponse(id, {
        nodeId: group.id,
        success: true
      });
      break;
    }
    
    case 'Checkbox': {
      const size = 20;
      
      // Create checkbox box
      const rect = figma.createRectangle();
      rect.x = params.x;
      rect.y = params.y;
      rect.resize(size, size);
      rect.cornerRadius = 2;
      rect.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      rect.strokes = [{ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 } }];
      rect.strokeWeight = 1;
      
      // Create label text
      const textNode = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      textNode.characters = params.text || 'Checkbox label';
      textNode.fontSize = 14;
      textNode.x = params.x + size + 8;
      textNode.y = params.y + (size - textNode.height) / 2;
      
      // Group the elements
      const group = figma.group([rect, textNode], figma.currentPage);
      group.name = params.name || 'Checkbox';
      
      elementIds.push(group.id);
      
      sendResponse(id, {
        nodeId: group.id,
        success: true
      });
      break;
    }
    
    case 'Card': {
      const width = params.width || 320;
      const height = params.height || 200;
      
      // Create card background
      const rect = figma.createRectangle();
      rect.x = params.x;
      rect.y = params.y;
      rect.resize(width, height);
      rect.cornerRadius = 8;
      rect.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      rect.effects = [
        {
          type: 'DROP_SHADOW',
          color: { r: 0, g: 0, b: 0, a: 0.1 },
          offset: { x: 0, y: 2 },
          radius: 8,
          spread: 0,
          visible: true,
          blendMode: 'NORMAL'
        }
      ];
      
      // Create card elements (title, content placeholder)
      const titleNode = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Bold" });
      titleNode.characters = 'Card Title';
      titleNode.fontSize = 18;
      titleNode.x = params.x + 16;
      titleNode.y = params.y + 16;
      
      const contentNode = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      contentNode.characters = params.text || 'Card content goes here. This is a placeholder for the card content.';
      contentNode.fontSize = 14;
      contentNode.x = params.x + 16;
      contentNode.y = params.y + 50;
      contentNode.resize(width - 32, height - 82);
      
      // Group the elements
      const group = figma.group([rect, titleNode, contentNode], figma.currentPage);
      group.name = params.name || 'Card';
      
      elementIds.push(group.id);
      
      sendResponse(id, {
        nodeId: group.id,
        success: true
      });
      break;
    }
    
    // Add more component types as needed
    
    default:
      sendResponse(id, {
        error: `Unknown component type: ${params.type}`
      });
  }
}

async function handleCreateLayout(id: string, params: {
  type: string,
  x: number,
  y: number,
  width?: number,
  height?: number,
  name?: string
}) {
  const elements: SceneNode[] = [];
  const elementIds: string[] = [];
  
  // Get current frame dimensions if we're working within a frame
  let frameWidth = 1440; // Default desktop width
  let frameHeight = 900; // Default desktop height
  
  if (figma.currentPage.selection.length > 0) {
    const selection = figma.currentPage.selection[0];
    if (selection.type === 'FRAME') {
      frameWidth = selection.width;
      frameHeight = selection.height;
    }
  }
  
  // Use provided width or calculate based on frame
  const width = params.width || frameWidth;
  
  switch (params.type) {
    case 'Header': {
      const headerHeight = params.height || 80;
      
      // Create header background
      const rect = figma.createRectangle();
      rect.x = params.x;
      rect.y = params.y;
      rect.resize(width, headerHeight);
      rect.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      elements.push(rect);
      elementIds.push(rect.id);
      
      // Create logo placeholder
      const logoText = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Bold" });
      logoText.characters = 'Logo';
      logoText.fontSize = 20;
      logoText.x = params.x + 20;
      logoText.y = params.y + (headerHeight - logoText.height) / 2;
      logoText.fills = [{ type: 'SOLID', color: { r: 0.12, g: 0.53, b: 0.9 } }];
      elements.push(logoText);
      elementIds.push(logoText.id);
      
      // Create navigation items
      const navItems = ['Home', 'About', 'Services', 'Contact'];
      let navX = params.x + width - 400;
      
      for (const item of navItems) {
        const navText = figma.createText();
        await figma.loadFontAsync({ family: "Inter", style: "Medium" });
        navText.characters = item;
        navText.fontSize = 16;
        navText.x = navX;
        navText.y = params.y + (headerHeight - navText.height) / 2;
        elements.push(navText);
        elementIds.push(navText.id);
        
        navX += navText.width + 30;
      }
      
      // Group the elements
      const group = figma.group(elements, figma.currentPage);
      group.name = params.name || 'Header';
      
      sendResponse(id, {
        groupId: group.id,
        elementIds: elementIds,
        success: true
      });
      break;
    }
    
    case 'Footer': {
      const footerHeight = params.height || 200;
      const footerY = params.y;
      
      // Create footer background
      const rect = figma.createRectangle();
      rect.x = params.x;
      rect.y = footerY;
      rect.resize(width, footerHeight);
      rect.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }];
      elements.push(rect);
      elementIds.push(rect.id);
      
      // Create footer columns
      const columns = ['Company', 'Resources', 'Legal'];
      const columnWidth = width / columns.length;
      
      for (let i = 0; i < columns.length; i++) {
        const columnX = params.x + i * columnWidth + 40;
        
        // Column title
        const titleText = figma.createText();
        await figma.loadFontAsync({ family: "Inter", style: "Bold" });
        titleText.characters = columns[i];
        titleText.fontSize = 18;
        titleText.x = columnX;
        titleText.y = footerY + 40;
        elements.push(titleText);
        elementIds.push(titleText.id);
        
        // Column links
        const links = ['Link 1', 'Link 2', 'Link 3'];
        for (let j = 0; j < links.length; j++) {
          const linkText = figma.createText();
          await figma.loadFontAsync({ family: "Inter", style: "Regular" });
          linkText.characters = links[j];
          linkText.fontSize = 14;
          linkText.x = columnX;
          linkText.y = footerY + 80 + j * 25;
          linkText.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
          elements.push(linkText);
          elementIds.push(linkText.id);
        }
      }
      
      // Copyright text
      const copyrightText = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      copyrightText.characters = '© 2025 Company Name. All rights reserved.';
      copyrightText.fontSize = 12;
      copyrightText.x = params.x + 40;
      copyrightText.y = footerY + footerHeight - 30;
      copyrightText.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
      elements.push(copyrightText);
      elementIds.push(copyrightText.id);
      
      // Group the elements
      const group = figma.group(elements, figma.currentPage);
      group.name = params.name || 'Footer';
      
      sendResponse(id, {
        groupId: group.id,
        elementIds: elementIds,
        success: true
      });
      break;
    }
    
    case 'Sidebar': {
      const sidebarWidth = params.width || 240;
      const sidebarHeight = params.height || frameHeight;
      
      // Create sidebar background
      const rect = figma.createRectangle();
      rect.x = params.x;
      rect.y = params.y;
      rect.resize(sidebarWidth, sidebarHeight);
      rect.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }];
      elements.push(rect);
      elementIds.push(rect.id);
      
      // Create sidebar title
      const titleText = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Bold" });
      titleText.characters = 'Dashboard';
      titleText.fontSize = 20;
      titleText.x = params.x + 20;
      titleText.y = params.y + 30;
      elements.push(titleText);
      elementIds.push(titleText.id);
      
      // Create menu items
      const menuItems = ['Home', 'Profile', 'Settings', 'Notifications', 'Logout'];
      let itemY = params.y + 80;
      
      for (const item of menuItems) {
        const itemText = figma.createText();
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });
        itemText.characters = item;
        itemText.fontSize = 16;
        itemText.x = params.x + 20;
        itemText.y = itemY;
        elements.push(itemText);
        elementIds.push(itemText.id);
        
        itemY += 40;
      }
      
      // Group the elements
      const group = figma.group(elements, figma.currentPage);
      group.name = params.name || 'Sidebar';
      
      sendResponse(id, {
        groupId: group.id,
        elementIds: elementIds,
        success: true
      });
      break;
    }
    
    case 'Hero': {
      const heroHeight = params.height || 500;
      
      // Create hero background
      const rect = figma.createRectangle();
      rect.x = params.x;
      rect.y = params.y;
      rect.resize(width, heroHeight);
      rect.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }];
      elements.push(rect);
      elementIds.push(rect.id);
      
      // Create hero title
      const titleText = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Bold" });
      titleText.characters = 'Your Headline Here';
      titleText.fontSize = 48;
      
      // Center the title
      titleText.resize(width - 200, titleText.height);
      titleText.textAlignHorizontal = 'CENTER';
      titleText.x = params.x + 100;
      titleText.y = params.y + heroHeight/2 - 80;
      elements.push(titleText);
      elementIds.push(titleText.id);
      
      // Create hero subtitle
      const subtitleText = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      subtitleText.characters = 'A detailed subheading that explains your value proposition.';
      subtitleText.fontSize = 20;
      
      // Center the subtitle
      subtitleText.resize(width - 300, subtitleText.height);
      subtitleText.textAlignHorizontal = 'CENTER';
      subtitleText.x = params.x + 150;
      subtitleText.y = params.y + heroHeight/2 - 10;
      subtitleText.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
      elements.push(subtitleText);
      elementIds.push(subtitleText.id);
      
      // Create hero CTA button
      const buttonWidth = 180;
      const buttonHeight = 50;
      const buttonRect = figma.createRectangle();
      buttonRect.x = params.x + (width - buttonWidth)/2;
      buttonRect.y = params.y + heroHeight/2 + 70;
      buttonRect.resize(buttonWidth, buttonHeight);
      buttonRect.cornerRadius = 4;
      buttonRect.fills = [{ type: 'SOLID', color: { r: 0.12, g: 0.53, b: 0.9 } }];
      elements.push(buttonRect);
      elementIds.push(buttonRect.id);
      
      const buttonText = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Medium" });
      buttonText.characters = 'Get Started';
      buttonText.fontSize = 16;
      buttonText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      
      // Center text in button
      buttonText.x = buttonRect.x + (buttonWidth - buttonText.width)/2;
      buttonText.y = buttonRect.y + (buttonHeight - buttonText.height)/2;
      elements.push(buttonText);
      elementIds.push(buttonText.id);
      
      // Group the elements
      const group = figma.group(elements, figma.currentPage);
      group.name = params.name || 'Hero Section';
      
      sendResponse(id, {
        groupId: group.id,
        elementIds: elementIds,
        success: true
      });
      break;
    }
    
    case 'Form': {
      const formWidth = params.width || 400;
      const formHeight = params.height || 400;
      
      // Create form title
      const titleText = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Bold" });
      titleText.characters = 'Contact Form';
      titleText.fontSize = 24;
      titleText.x = params.x;
      titleText.y = params.y;
      elements.push(titleText);
      elementIds.push(titleText.id);
      
      // Create form fields
      const fields = [
        { label: 'Name', placeholder: 'Enter your name' },
        { label: 'Email', placeholder: 'Enter your email' },
        { label: 'Message', placeholder: 'Type your message here', height: 100 }
      ];
      
      let fieldY = params.y + 60;
      for (const field of fields) {
        // Label
        const labelText = figma.createText();
        await figma.loadFontAsync({ family: "Inter", style: "Medium" });
        labelText.characters = field.label;
        labelText.fontSize = 14;
        labelText.x = params.x;
        labelText.y = fieldY;
        elements.push(labelText);
        elementIds.push(labelText.id);
        
        fieldY += 30;
        
        // Input field
        const fieldHeight = field.height || 40;
        const inputRect = figma.createRectangle();
        inputRect.x = params.x;
        inputRect.y = fieldY;
        inputRect.resize(formWidth, fieldHeight);
        inputRect.cornerRadius = 4;
        inputRect.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.97 } }];
        inputRect.strokes = [{ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 } }];
        inputRect.strokeWeight = 1;
        elements.push(inputRect);
        elementIds.push(inputRect.id);
        
        // Placeholder text
        const placeholderText = figma.createText();
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });
        placeholderText.characters = field.placeholder;
        placeholderText.fontSize = 14;
        placeholderText.x = params.x + 10;
        placeholderText.y = fieldY + (fieldHeight - placeholderText.height)/2;
        placeholderText.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
        elements.push(placeholderText);
        elementIds.push(placeholderText.id);
        
        fieldY += fieldHeight + 20;
      }
      
      // Submit button
      const buttonWidth = 120;
      const buttonHeight = 40;
      const buttonRect = figma.createRectangle();
      buttonRect.x = params.x;
      buttonRect.y = fieldY + 10;
      buttonRect.resize(buttonWidth, buttonHeight);
      buttonRect.cornerRadius = 4;
      buttonRect.fills = [{ type: 'SOLID', color: { r: 0.12, g: 0.53, b: 0.9 } }];
      elements.push(buttonRect);
      elementIds.push(buttonRect.id);
      
      const buttonText = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Medium" });
      buttonText.characters = 'Submit';
      buttonText.fontSize = 14;
      buttonText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      
      // Center text in button
      buttonText.x = buttonRect.x + (buttonWidth - buttonText.width)/2;
      buttonText.y = buttonRect.y + (buttonHeight - buttonText.height)/2;
      elements.push(buttonText);
      elementIds.push(buttonText.id);
      
      // Group the elements
      const group = figma.group(elements, figma.currentPage);
      group.name = params.name || 'Contact Form';
      
      sendResponse(id, {
        groupId: group.id,
        elementIds: elementIds,
        success: true
      });
      break;
    }
    
    case 'Grid': {
      const gridWidth = params.width || width;
      const gridHeight = params.height || 600;
      const columns = 3;
      const rows = 2;
      
      // Create grid title
      const titleText = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Bold" });
      titleText.characters = 'Featured Items';
      titleText.fontSize = 24;
      titleText.x = params.x;
      titleText.y = params.y;
      elements.push(titleText);
      elementIds.push(titleText.id);
      
      // Calculate card dimensions
      const cardPadding = 20;
      const cardWidth = (gridWidth - (cardPadding * (columns + 1))) / columns;
      const cardHeight = 200;
      
      // Create grid of cards
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const cardX = params.x + col * (cardWidth + cardPadding) + cardPadding;
          const cardY = params.y + 60 + row * (cardHeight + cardPadding);
          
          // Card background
          const cardRect = figma.createRectangle();
          cardRect.x = cardX;
          cardRect.y = cardY;
          cardRect.resize(cardWidth, cardHeight);
          cardRect.cornerRadius = 8;
          cardRect.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
          cardRect.effects = [
            {
              type: 'DROP_SHADOW',
              color: { r: 0, g: 0, b: 0, a: 0.1 },
              offset: { x: 0, y: 2 },
              radius: 8,
              spread: 0,
              visible: true,
              blendMode: 'NORMAL'
            }
          ];
          elements.push(cardRect);
          elementIds.push(cardRect.id);
          
          // Card image placeholder
          const imageRect = figma.createRectangle();
          imageRect.x = cardX;
          imageRect.y = cardY;
          imageRect.resize(cardWidth, 100);
          imageRect.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
          elements.push(imageRect);
          elementIds.push(imageRect.id);
          
          // Card title
          const cardTitle = figma.createText();
          await figma.loadFontAsync({ family: "Inter", style: "Medium" });
          cardTitle.characters = `Item ${row * columns + col + 1}`;
          cardTitle.fontSize = 16;
          cardTitle.x = cardX + 10;
          cardTitle.y = cardY + 110;
          elements.push(cardTitle);
          elementIds.push(cardTitle.id);
          
          // Card description
          const cardDesc = figma.createText();
          await figma.loadFontAsync({ family: "Inter", style: "Regular" });
          cardDesc.characters = 'Short description goes here';
          cardDesc.fontSize = 12;
          cardDesc.x = cardX + 10;
          cardDesc.y = cardY + 140;
          cardDesc.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
          elements.push(cardDesc);
          elementIds.push(cardDesc.id);
        }
      }
      
      // Group the elements
      const group = figma.group(elements, figma.currentPage);
      group.name = params.name || 'Grid Layout';
      
      sendResponse(id, {
        groupId: group.id,
        elementIds: elementIds,
        success: true
      });
      break;
    }
    
    default:
      sendResponse(id, {
        error: `Unknown layout type: ${params.type}`
      });
  }
}

async function handleCreateInteraction(id: string, params: {
    sourceId: string,
    targetId: string,
    trigger?: string,
    transition?: string
  }) {
    // Find the source and target nodes
    const sourceNode = figma.getNodeById(params.sourceId);
    const targetNode = figma.getNodeById(params.targetId);
    
    if (!sourceNode) {
      return sendResponse(id, {
        error: `Source node with ID ${params.sourceId} not found`
      });
    }
    
    if (!targetNode) {
      return sendResponse(id, {
        error: `Target node with ID ${params.targetId} not found`
      });
    }
    
    // Create prototype link
    if ('reactions' in sourceNode) {
      // Convert string values to correct enum types
      const triggerType = params.trigger === 'On Hover' ? 'HOVER' : 
                          params.trigger === 'On Press' ? 'MOUSE_DOWN' :
                          params.trigger === 'On Drag' ? 'DRAG' : 'CLICK';
      
      const transitionType = params.transition === 'Dissolve' ? 'DISSOLVE' :
                             params.transition === 'Smart Animate' ? 'SMART_ANIMATE' :
                             params.transition === 'Push' ? 'PUSH' :
                             params.transition === 'Slide In' ? 'SLIDE_IN' :
                             params.transition === 'Slide Out' ? 'SLIDE_OUT' : 'INSTANT';
      
      // Determine if we need a directional transition
      const isDirectionalTransition = 
        params.transition === 'Push' || 
        params.transition === 'Slide In' || 
        params.transition === 'Slide Out';
      
      // Create the appropriate transition object
      let transitionObj;
      if (isDirectionalTransition) {
        transitionObj = {
          type: transitionType as any,
          direction: 'RIGHT', // Default direction, modify as needed
          matchLayers: false, // Default value
          easing: { type: 'EASE_OUT' as const }, // Default easing
          duration: 300
        };
      } else {
        transitionObj = {
          type: transitionType as any,
          easing: { type: 'EASE_OUT' as const }, // Default easing
          duration: 300
        };
      }
      
      sourceNode.reactions = [
        {
          action: {
            type: 'NODE',
            destinationId: params.targetId,
            navigation: 'NAVIGATE',
            transition: transitionObj,
            preserveScrollPosition: false
          },
          trigger: {
            type: triggerType as any // Use type assertion here
          }
        }
      ];
      
      sendResponse(id, {
        success: true
      });
    } else {
      sendResponse(id, {
        error: 'Source node does not support interactions'
      });
    }
}

async function handleExportFrame(id: string, params: {
  frameId: string,
  format?: string,
  scale?: number
}) {
  // Find the frame to export
  const node = figma.getNodeById(params.frameId);
  
  if (!node) {
    return sendResponse(id, {
      error: `Node with ID ${params.frameId} not found`
    });
  }
  
  if (node.type !== 'FRAME') {
    return sendResponse(id, {
      error: `Node with ID ${params.frameId} is not a frame`
    });
  }
  
  // Set export settings
  const format = params.format?.toLowerCase() || 'png';
  const scale = params.scale || 1;
  
  type ExportSettingsImage = {
    format: 'JPG' | 'PNG' | 'SVG' | 'PDF';
    constraint: {
      type: 'SCALE';
      value: number;
    };
  };

  try {
    const settings: ExportSettingsImage = {
      format: format === 'jpg' ? 'JPG' : 
              format === 'svg' ? 'SVG' : 
              format === 'pdf' ? 'PDF' : 'PNG',
      constraint: { type: 'SCALE', value: scale }
    };
    
    // In a real implementation, we would use figma.ui to show a custom UI for export
    // Since we can't actually export files directly from the plugin API without user interaction,
    // we'll just simulate this for the example
    
    // Simulate export URL (in a real implementation, this would be handled by the plugin UI)
    const exportUrl = `https://figma.exports/${node.id}_${Date.now()}.${format}`;
    
    sendResponse(id, {
      success: true,
      exportUrl
    });
  } catch (err) {
    const error = err as Error;
    sendResponse(id, {
      error: `Export failed: ${error.message}`
    });
  }
}

async function handleExportCurrentFrame(id: string, params: {
  format?: string,
  scale?: number
}) {
  // Use current selection or current page
  let node: null | FrameNode = null;
  
  if (figma.currentPage.selection.length > 0) {
    const selection = figma.currentPage.selection[0];
    if (selection.type === 'FRAME') {
      node = selection as FrameNode;
    }
  }
  
  // If no frame is selected, try to find the first frame in the current page
  if (!node) {
    for (const child of figma.currentPage.children) {
      if (child.type === 'FRAME') {
        node = child as FrameNode;
        break;
      }
    }
  }
  
  if (!node) {
    return sendResponse(id, {
      error: 'No frame found to export'
    });
  }

  // Reuse the export frame handler
  await handleExportFrame(id, {
    frameId: node.id,
    format: params.format,
    scale: params.scale
  });
}

async function handleGeneratePrototype(id: string, params: any) {
  // In a real implementation, this would configure the prototype settings
  // and possibly create interactions between frames
  
  // For this example, we'll just simulate returning a prototype URL
  const prototypeUrl = `https://figma.prototype/${figma.fileKey}?node=${figma.currentPage.id}`;
  
  sendResponse(id, {
    success: true,
    prototypeUrl
  });
}

// Helper function to convert hex color to RGB
function hexToRgb(hex: string) {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  return { r, g, b };
}

// Initialize
connect();

// Set up Figma plugin
figma.showUI(__html__, { width: 300, height: 400 });

figma.ui.onmessage = message => {
  if (message.type === 'connect') {
    connect();
  }
};

// Fix for ARIA errors in the UI
figma.ui.onmessage = (msg) => {
  if (msg.type === 'connect') {
    connect();
  }
};

// Set up error handling for the plugin
console.error = (...args) => {
  figma.notify(`Error: ${args.join(' ')}`, { error: true });
  console.log(...args); // Still log to console
};

// Keep the plugin running
figma.on('selectionchange', () => {
  // Update UI with selection information
  if (figma.currentPage.selection.length > 0) {
    const selection = figma.currentPage.selection[0];
    figma.ui.postMessage({ 
      type: 'selection',
      selection: {
        id: selection.id,
        name: selection.name,
        type: selection.type
      }
    });
  }
});