/**
 * @class JsClassParser
 * @extends Object
 * @classdesc This class is used to parse JavaScript classes and extract their documentation.
 */

class JsClassParser extends Object {
    constructor (code, filePath) {
        super(); // Add this line to call the parent constructor
        this.code = code;
        this.lines = code.split('\n'); 
        this.filePath = filePath;
        this.comments = [];
        this.properties = [];
        this.propertyCategories = {};
    }

    parse () {
        let ast;
        try {
            // First, try to parse the entire file
            ast = acorn.parse(this.code, { 
                ecmaVersion: 2020, 
                sourceType: 'module', 
                locations: true, 
                onComment: (isBlock, text, start, end) => {
                    // Only add block comments to this.comments
                    if (isBlock) {
                        this.comments.push({ type: 'Block', value: text, start, end });
                    }
                }
            });
        } catch (error) {
            console.error("Parsing error:", error.message);
            if (error.loc) {
                console.error(`Error location: Line ${error.loc.line}, Column ${error.loc.column}`);
                console.error("Problematic code:", this.code.split('\n')[error.loc.line - 1]);
            }
            
            // Check if the error is about missing super() call
            if (error.message.includes("'super()' must be called")) {
                console.warn("The class being parsed might be missing a super() call in its constructor.");
                console.warn("Class content:", this.code);
            }
            
            // If parsing fails, try to extract the class definition
            const classMatch = this.code.match(/\/\*\*([\s\S]*?)\*\/\s*\(class\s+(\w+)[\s\S]*?{([\s\S]*?)}\s*\)\s*\.initThisCategory\(\);/);
            if (classMatch) {
                const classComment = classMatch[1];
                const className = classMatch[2];
                const classBody = classMatch[3];
                
                console.log(`Extracted class name: ${className}`);
                console.log(`Class body:`, classBody);
                
                // Create a valid class syntax for parsing
                const validClassCode = `
                    /**${classComment}*/
                    class ${className} {
                        ${classBody}
                    }
                `;
                
                try {
                    ast = acorn.parse(validClassCode, { 
                        ecmaVersion: 2020, 
                        sourceType: 'module', 
                        locations: true, 
                        onComment: (isBlock, text, start, end) => {
                            this.comments.push({ type: isBlock ? 'Block' : 'Line', value: text, start, end });
                        }
                    });
                } catch (innerError) {
                    console.error("Failed to parse extracted class:", innerError.message);
                    if (innerError.loc) {
                        console.error(`Error location: Line ${innerError.loc.line}, Column ${innerError.loc.column}`);
                        console.error("Problematic code:", validClassCode.split('\n')[innerError.loc.line - 1]);
                    }
                    return this.fallbackParse();
                }
            } else {
                console.warn("Could not extract class definition. Falling back to basic parsing.");
                return this.fallbackParse();
            }
        }

        try {
            const result = {
                classInfo: {
                    className: '',
                    extends: '',
                    filePath: this.filePath,
                    description: 'Undocumented'
                },
                methods: [],
                propertyCategories: {},
                categories: {},
            };

            // Find the class declaration or expression
            let classNode = null;
            acorn.walk.simple(ast, {
                ClassDeclaration: (node) => {
                    if (!classNode) classNode = node;
                },
                ClassExpression: (node) => {
                    if (!classNode) classNode = node;
                }
            });

            if (classNode) {
                this.handleClassNode(classNode, result);
            }

            // Parse methods
            acorn.walk.simple(ast, {
                MethodDefinition: (node) => {
                    try {
                        this.handleMethodNode(node, result);
                    } catch (error) {
                        console.error(`Error parsing method: ${node.key.name}`, error);
                    }
                },
                Property: (node) => {
                    // Handle methods defined as properties (e.g., arrow functions)
                    if (typeof node.value === 'function' || node.value.type === 'FunctionExpression' || node.value.type === 'ArrowFunctionExpression') {
                        try {
                            this.handleMethodNode(node, result);
                        } catch (error) {
                            console.error(`Error parsing property method: ${node.key.name}`, error);
                        }
                    }
                }
            });

            // After parsing methods, add this block to parse properties
            this.parseProperties();
            result.propertyCategories = this.propertyCategories;

            // After parsing all methods and properties, categorize them
            this.categorizeMethods(result);

            console.log("Final JSON output:", JSON.stringify(result, null, 2));
            return result;
        } catch (error) {
            console.error("Error in parse method:", error);
            return this.fallbackParse();
        }
    }

    fallbackParse () {
        console.log("Entering fallback parsing mode");
        const result = {
            classInfo: {
                className: 'Unknown',
                extends: '',
                filePath: this.filePath,
                description: `Unable to fully parse the class due to syntax errors. Fallback parsing applied.`
            },
            methods: []
        };

        // Try to extract class name and methods using regex
        const classMatch = this.code.match(/class\s+(\w+)/);
        if (classMatch) {
            result.classInfo.className = classMatch[1];
            console.log(`Fallback parsing: Found class name ${result.classInfo.className}`);
        } else {
            console.warn("Fallback parsing: Could not determine class name");
        }

        const methodRegex = /(static\s+)?(\w+)\s*\(([^)]*)\)\s*{/g;
        let match;
        while ((match = methodRegex.exec(this.code)) !== null) {
            const isStatic = !!match[1];
            const methodName = match[2];
            const parameters = match[3].split(',').map(param => param.trim()).filter(param => param);
            console.log(`Fallback parsing: Found method ${methodName}`);
            result.methods.push({
                methodName: methodName,
                fullMethodName: `${isStatic ? 'static ' : ''}${methodName}(${match[3]})`,
                parameters: parameters.map(param => ({
                    paramName: param,
                    paramType: 'unknown',
                    description: 'Parameter extracted during fallback parsing.'
                })),
                description: `Method extracted during fallback parsing.`,
                isAsync: false,
                access: isStatic ? 'static' : 'public',
                isStatic: isStatic
            });
        }

        console.log("Fallback parsing complete");
        return result;
    }

    handleClassNode (node, result) {
        if (node.id) {
            result.classInfo.className = node.id.name;
        }
        if (node.superClass) {
            result.classInfo.extends = node.superClass.name;
        }
        
        const classComments = this.getClassComments(node.start);
        
        const { description, entries } = this.extractJSDocInfo(classComments);
        
        result.classInfo.description = entries.classdesc || entries.description || description || 'Undocumented';
        if (entries.class) {
            result.classInfo.className = entries.class;
        }
        if (entries.extends) {
            result.classInfo.extends = entries.extends;
        }
        result.classInfo.filePath = this.filePath;
    }

    handleMethodNode (node, result) {
        const methodName = node.key ? node.key.name : node.method ? node.method.name : 'anonymous';
        const methodComments = this.getMethodComments(node.start);

        const { description, entries } = this.extractJSDocInfo(methodComments);

        // Get the method arguments
        const args = node.value && node.value.params ? 
            node.value.params.map(param => param.name).join(', ') :
            node.params ? node.params.map(param => param.name).join(', ') : '';

        const fullMethodName = args ? `${methodName}(${args})` : methodName;

        const methodInfo = {
            methodName,
            fullMethodName: `${node.value && node.value.async ? 'async ' : ''}${fullMethodName}`,
            isAsync: node.value ? node.value.async : false,
            parameters: entries.params || [],
            access: this.getAccessModifier(node),
            isStatic: node.static || false,
            description: description || (entries.returns ? '' : 'Undocumented'),
            example: entries.example || null,
            deprecated: entries.deprecated || null,
            since: entries.since || null,
            lineNumberStart: node.loc.start.line,
            lineNumberEnd: node.loc.end.line,
            source: this.getMethodSource(node),  // Add this line
            category: entries.category || 'Uncategorized'  // Add this line
        };

        // Remove the class description from the method if it matches
        if (methodInfo.description === result.classInfo.description) {
            methodInfo.description = 'Undocumented';
        }

        if (entries.throws && entries.throws.trim() !== '') {
            methodInfo.throws = entries.throws;
        }

        if (entries.returns && (entries.returns.returnType || entries.returns.description)) {
            methodInfo.returns = entries.returns;
        }

        result.methods.push(methodInfo);
    }

    getAccessModifier (node) {
        if (node.kind === 'constructor') return 'constructor';
        if (node.static) return 'static';
        if (node.key && node.key.name.startsWith('_')) return 'private';
        return 'public';
    }

    getClassComments (classStart) {
        const relevantComments = this.comments
            .filter(comment => comment.end <= classStart)
            .sort((a, b) => b.end - a.end);

        if (relevantComments.length > 0) {
            return relevantComments[0].value;
        }

        return '';
    }

    getMethodComments (methodStart) {
        const relevantComments = this.comments
            .filter(comment => 
                comment.end < methodStart && 
                comment.value.trim().startsWith('*')
            )
            .sort((a, b) => b.end - a.end);

        if (relevantComments.length > 0) {
            const closestComment = relevantComments[0];
            // Remove the comment from the list to avoid reusing it for other methods
            this.comments = this.comments.filter(comment => comment !== closestComment);
            return closestComment.value;
        }

        return '';
    }

    extractJSDocInfo (comment) {
        const lines = comment.split('\n');
        
        let description = [];
        const entries = { 
            params: [], 
            returns: null, 
            throws: null, 
            example: null, 
            deprecated: null, 
            since: null, 
            description: null, 
            classdesc: null,
            member: null,
            category: null,
            default: null,  // Add this line
            type: null  // Add this line
        };
        let currentTag = null;
        let currentTagContent = [];

        lines.forEach(line => {
            const trimmedLine = line.trim().replace(/^\*\s?/, '');
            const tagMatch = trimmedLine.match(/^@(\w+)/);
            if (tagMatch) {
                if (currentTag) {
                    this.processTag(currentTag, currentTagContent.join('\n'), entries);
                }
                currentTag = tagMatch[1];
                currentTagContent = [trimmedLine.slice(tagMatch[0].length).trim()];
            } else if (currentTag) {
                currentTagContent.push(trimmedLine);
            } else if (trimmedLine !== '') {
                description.push(trimmedLine);
            }
        });

        if (currentTag) {
            this.processTag(currentTag, currentTagContent.join('\n'), entries);
        }

        return {
            description: entries.description || description.join('\n'),
            entries
        };
    }

    processTag (tag, content, entries) {
        switch (tag) {
            case 'param':
                const [paramType, paramName, ...paramDesc] = content.split(/\s+/);
                entries.params.push({
                    paramName: paramName ? paramName.replace('-', '').trim() : 'unnamed',
                    paramType: escapeXml((paramType || '').replace(/[{}]/g, '').trim()),
                    description: escapeXml(paramDesc.join(' ').trim().replace(/^- /, '')) // Remove leading "- "
                });
                break;
            case 'returns':
                const [returnType, ...returnDesc] = content.split(/\s+/);
                entries.returns = {
                    returnType: escapeXml((returnType || '').replace(/[{}]/g, '').trim()),
                    description: escapeXml(returnDesc.join(' ').trim()) || null
                };
                break;
            case 'throws':
                entries[tag] = escapeXml(content.trim());
                break;
            case 'example':
            case 'deprecated':
            case 'since':
            case 'class':
            case 'extends':
            case 'description':
            case 'classdesc':
                entries[tag] = content.trim();
                break;
            case 'member':
                const [memberType, memberName, ...memberDesc] = content.split(/\s+/);
                entries.member = {
                    propertyName: memberName || (entries.type ? entries.type.propertyName : 'unnamed'),
                    propertyType: escapeXml((memberType || '').replace(/[{}]/g, '').trim()),
                    description: escapeXml(memberDesc.join(' ').trim())
                };
                break;
            case 'type':
                const [typeValue, typeName] = content.split(/\s+/);
                entries.type = {
                    propertyName: typeName ? typeName.trim() : 'unnamed',
                    propertyType: escapeXml((typeValue || '').replace(/[{}]/g, '').trim())
                };
                break;
            case 'default':
                entries.default = content.trim();
                break;
            case 'category':
                entries.category = content.trim();
                break;
            case 'description':
                entries.description = content.trim();
                break;
            default:
                console.warn(`Unknown tag: @${tag}`);
                break;
        }
    }

    // Add this new method to parse properties
    parseProperties () {
        const propertyRegex = /\/\*\*\s*([\s\S]*?)\s*\*\//g;
        let match;
        while ((match = propertyRegex.exec(this.code)) !== null) {
            const propertyComments = match[1];
            const { entries } = this.extractJSDocInfo(propertyComments);
            
            if (entries.member) {
                const property = {
                    propertyName: entries.member.propertyName,
                    propertyType: entries.member.propertyType,
                    description: entries.description || entries.member.description || 'Undocumented',
                    category: entries.category || 'Uncategorized',
                    default: entries.default || null
                };

                if (!this.propertyCategories[property.category]) {
                    this.propertyCategories[property.category] = [];
                }
                this.propertyCategories[property.category].push(property);
            }
        }
    }

    // Add this new method to extract the source code
    getMethodSource (node) {
        const startLine = node.loc.start.line - 1;  // Adjust for 0-based array index
        const endLine = node.loc.end.line;
        
        // Get the original indentation of the first line
        const firstLine = this.lines[startLine];
        const indentMatch = firstLine.match(/^\s*/);
        const baseIndent = indentMatch ? indentMatch[0] : '';
        
        // Slice the relevant lines and preserve their original formatting
        const sourceLines = this.lines.slice(startLine, endLine);
        
        // Remove the base indentation from each line
        const trimmedLines = sourceLines.map(line => {
            if (line.startsWith(baseIndent)) {
                return line.slice(baseIndent.length);
            }
            return line;
        });
        
        return trimmedLines.join('\n');
    }

    categorizeMethods (result) {
        result.methods.forEach(method => {
            const category = method.category || 'Uncategorized';
            if (!result.categories[category]) {
                result.categories[category] = [];
            }
            result.categories[category].push(method);
        });
    }

    // Remove this method
    // categorizeProperties(result) { ... }
}

function jsonToXml (json) {
    let xml = '';
    for (const key in json) {
        if (Object.hasOwn(json, key)) {
            const value = json[key];
            if (key === 'methods') {
                xml += '<methods>\n';
                value.forEach((method) => {
                    xml += `<method>\n${jsonToXml(method)}</method>\n`;
                });
                xml += '</methods>\n';
            } else if (key === 'parameters') {
                xml += '<parameters>\n';
                value.forEach((param) => {
                    xml += `<parameter>\n${jsonToXml(param)}</parameter>\n`;
                });
                xml += '</parameters>\n';
            } else if (key === 'properties') {
                xml += '<properties>\n';
                value.forEach((property) => {
                    xml += `<property>\n${jsonToXml(property)}</property>\n`;
                });
                xml += '</properties>\n';
            } else if (key === 'classInfo') {
                xml += '<classInfo>\n';
                for (const classKey in value) {
                    if (classKey === 'filePath') {
                        xml += `<filePath><a href="${escapeXml(value[classKey])}">${escapeXml(value[classKey])}</a></filePath>\n`;
                    } else if (classKey === 'description') {
                        xml += `<description>${escapeXmlPreserveWhitespace(value[classKey])}</description>\n`;
                    } else {
                        xml += `<${classKey}>${escapeXml(value[classKey])}</${classKey}>\n`;
                    }
                }
                xml += '</classInfo>\n';
            } else if (typeof value === 'object' && value !== null) {
                xml += `<${key}>${jsonToXml(value)}</${key}>\n`;
            } else if (value !== undefined && value !== '') {
                if (typeof value === 'boolean') {
                    xml += `<${key}>${value ? 'true' : 'false'}</${key}>\n`;
                } else if (key === 'fullMethodName') {
                    const methodName = value.replace('async ', '');
                    xml += `<${key}${value.startsWith('async ') ? ' async="true"' : ''}>${escapeXml(methodName)}</${key}>\n`;
                } else if (['access', 'isStatic', 'example', 'deprecated', 'since', 'returns'].includes(key)) {
                    if (value && (typeof value === 'string' ? value.trim() !== '' : Object.keys(value).length > 0)) {
                        xml += `<${key}>${jsonToXml(value)}</${key}>\n`;
                    }
                } else if (key === 'description') {
                    xml += `<${key}>${escapeXmlPreserveWhitespace(value)}</${key}>\n`;
                } else {
                    xml += `<${key}>${escapeXml(value)}</${key}>\n`;
                }
            }
        }
    }
    return xml;
}

function escapeXml (unsafe) {
    if (unsafe === undefined || unsafe === null) {
        return '';
    }
    return unsafe.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeXmlPreserveWhitespace (unsafe) {
    if (unsafe === undefined || unsafe === null) {
        return '';
    }
    return unsafe.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\t/g, "&#9;")   // Preserve tabs
        .replace(/```([\s\S]*?)```/g, (match, content) => {
            return `<code>${content}</code>`;
        });
}

function displayClassInfo (result) {
    const outputElement = document.getElementById('output');
    
    // Set the page title to the class name
    document.title = result.classInfo.className;
    
    // Separate class methods from instance methods
    const classMethods = result.methods.filter(method => method.isStatic);
    const instanceMethods = result.methods.filter(method => !method.isStatic);

    // Get all categories
    const allCategories = new Set([
        ...Object.keys(result.propertyCategories),
        ...classMethods.map(m => m.category),
        ...instanceMethods.map(m => m.category)
    ]);

    const xmlOutput = `
        <class>
            <classInfo>
                <className>${escapeXml(result.classInfo.className)}</className>
                <extends>${escapeXml(result.classInfo.extends)}</extends>
                <filePath><a href="${escapeXml(result.classInfo.filePath)}">${escapeXml(result.classInfo.filePath)}</a></filePath>
                <description>${escapeXmlPreserveWhitespace(result.classInfo.description)}</description>
            </classInfo>
            ${generateCategorizedXml('properties', result.propertyCategories, result.classInfo.filePath)}
            ${generateCategorizedXml('classMethods', classMethods, result.classInfo.filePath)}
            ${generateCategorizedXml('instanceMethods', instanceMethods, result.classInfo.filePath)}
        </class>
    `;
    outputElement.innerHTML = xmlOutput;
}

function generateCategorizedXml (sectionName, items, filePath) {
    const categories = {};
    if (sectionName === 'properties') {
        Object.assign(categories, items);
    } else {
        items.forEach(item => {
            const category = item.category || 'Uncategorized';
            if (!categories[category]) categories[category] = [];
            categories[category].push(item);
        });
    }

    const categoryXml = Object.entries(categories)
        .filter(([, categoryItems]) => categoryItems.length > 0)
        .map(([category, categoryItems]) => `
            <category>
                ${category !== 'Uncategorized' ? `<name>${escapeXml(category)}</name>` : ''}
                ${categoryItems.map(item => 
                    sectionName === 'properties' ? generatePropertyXml(item) : generateMethodXml(item, filePath)
                ).join('')}
            </category>
        `).join('');

    return categoryXml ? `<${sectionName}>${categoryXml}</${sectionName}>` : '';
}

function generateMethodXml (method, filePath) {
    let xml = '<method>\n';
    xml += `  <name class="collapsible">${escapeHtml(method.methodName)}</name>\n`;
    xml += `  <fullMethodName class="collapsible">${escapeHtml(method.fullMethodName.replace(/^static\s+/, ''))}</fullMethodName>\n`;
    xml += `  <div class="collapsible-content">\n`;
    xml += `    <methodinfo>\n`;
    xml += `      <div class="method-info-content">\n`; // Add this line
    xml += `      <lineNumberStart>${method.lineNumberStart}</lineNumberStart>\n`;
    xml += `      <lineNumberEnd>${method.lineNumberEnd}</lineNumberEnd>\n`;
    
    // Output params first
    if (method.parameters && method.parameters.length > 0) {
        xml += '  <params>\n';
        method.parameters.forEach(param => {
            xml += '    <param>\n';
            xml += `      <paramname>${param.paramName}</paramname>\n`;
            xml += `      <paramtype>${param.paramType}</paramtype>\n`;
            if (param.description) {
                xml += `      <description>${param.description}</description>\n`;
            }
            xml += '    </param>\n';
        });
        xml += '  </params>\n';
    }
    
    // Output method description after params
    if (method.description || method.returns) {
        if (method.description) {
            xml += `  <description>${method.description}</description>\n`;
        } else {
        }
    } else {
        xml += `  <description>Undocumented</description>\n`;
    }
    
    // Output returns if present
    if (method.returns) {
        xml += '  <returns>\n';
        xml += `    <returntype>${method.returns.returnType}</returntype>\n`;
        if (method.returns.description) {
            xml += `    <description>${method.returns.description}</description>\n`;
        }
        xml += '  </returns>\n';
    }
    
    xml += `  <isAsync>${method.isAsync}</isAsync>\n`;
    xml += `  <access>${method.access}</access>\n`;
    xml += `  <isStatic>${method.isStatic}</isStatic>\n`;
    if (method.example) {
        xml += `  <example>${method.example}</example>\n`;
    }
    if (method.deprecated) {
        xml += `  <deprecated>${method.deprecated}</deprecated>\n`;
    }
    if (method.since) {
        xml += `  <since>${method.since}</since>\n`;
    }
    if (method.throws) {
        xml += `  <throws>${method.throws}</throws>\n`;
    }
    xml += `  <category>${escapeHtml(method.category)}</category>\n`;
    
    // Escape the source code content
    const escapedSource = escapeHtml(method.source);
    
    // Add the method source code with a collapsible wrapper
    xml += `      <div class="source-wrapper">\n`;
    xml += `        <div class="source-toggle collapsible">source</div>\n`;
    xml += `        <methodsource class="collapsible-content">${escapedSource}</methodsource>\n`;
    xml += `      </div>\n`;
    
    xml += `      </div>\n`; // Add this line
    
    xml += `    </methodinfo>\n`;
    xml += `  </div>\n`;
    xml += '</method>\n';

    return xml;
}

// Add this new function to generate XML for properties
function generatePropertyXml (property) {
    let xml = '<property>\n';
    xml += `  <propertyname>${escapeXml(property.propertyName)}</propertyname>\n`;
    xml += `  <propertytype>${escapeXml(property.propertyType)}</propertytype>\n`;
    xml += `  <description>${escapeXmlPreserveWhitespace(property.description)}</description>\n`;
    xml += `  <category>${escapeXml(property.category)}</category>\n`;
    if (property.default !== null) {
        xml += `  <default>${escapeXml(property.default)}</default>\n`;
    }
    xml += '</property>\n';
    return xml;
}

// Add this new function to escape HTML
function escapeHtml (unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('path');

    if (!path) {
        console.error('No path parameter provided');
        return;
    }

    try {
        console.log(`Attempting to load class file from: ${path}`);  // Add this line
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const code = await response.text();
        
        const parser = new JsClassParser(code, path);
        const result = parser.parse();

        displayClassInfo(result);

        // Initialize all methods as collapsed
        const methods = document.querySelectorAll('method');
        methods.forEach(method => {
            method.classList.add('collapsed');
        });

        // Add event listeners for collapsible elements
        const collapsibles = document.querySelectorAll('.collapsible');
        collapsibles.forEach(collapsible => {
            collapsible.addEventListener('click', function () {
                const content = this.nextElementSibling;
                content.classList.toggle('show');
                const methodElement = this.closest('method');
                methodElement.classList.toggle('expanded');
                methodElement.classList.toggle('collapsed');
                // Update the indicator
                this.classList.toggle('expanded');
            });
        });
    } catch (error) {
        console.error(`Error loading class file from ${path}:`, error);  // Modify this line
    }
});

