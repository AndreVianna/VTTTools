# Prompt Flow Control DSL Syntax

The following syntax should be use to leverage LLM natural language processing capabilities by allowing basic flow control within the slash commands definitions, agent definitions, template documents and user prompts in general.
Since those contents are processed by LLMs it combines the LLM capability of handle natural languages with a basic programming control flows to allow better consistency and formality to the definition of slash commands, agents, and templates.

## 1. Variables

- Syntax: `{variable_name}` or `{variable_name:type}` # Optional type hints for clarity

- Names: **snake_case**, **case-insensitive**, start with letter, then letters/numbers
  
  - valid name: `{a23}`, `{user_name}`, `{address_2}`
  - same variable: `{User}` or `{user}` or `{USER}`
  - invalid name: `{12a}`, `{user-name}`, `{mail address}`

- Sources: command arguments, inline assignments

- Types:
  
  - `{name:string}="John"` or `{title}="Sleepwalkers, the awakening"`,
  - `{count:number}=5` or `{age}=30`,
  - `{is_enabled:flag}=true` or `{finished}=false`,
  - `{items:list of strings}=["item1", "item2", "item3"]` or `{numbers}=[1, 2, 3]`
  - if omitted and has no assignment assume `string`

- slash command argument hints can have one more hint in the variable name: `{variable_name:type:required}
  
  - required can be `required` or `optional` or `optional(default_value)`
  - if omitted assume `required`
  - if optional has no default value assume `""`, `0`, `false`, or `[]`, depending on the type

## 2. Conditions

- Syntax: `(conditional expression)`
- conditional expression can be: A flag variable or a logical expression to be evaluated by the LLM
- Examples:
  - `({is_enabled})`
  - `({count} is lower than 3)`
  - `({process_result} has no errors)`

## 3. Control Flow

### Branching

- `<if (conditional expression)>...<else>...</if>`
- `<case {variable}><is {VALUE}>...<otherwise>...</case>`

### Loops

- `<foreach {item} in {list}>...<continue>...<break>...</foreach>`      # Loop over list items
- `<repeat {count} TIMES>...<continue>...<break>...</repeat>`           # Repeat block N times
- `<while (conditional expression)>...<continue>...<break>...</while>`  # Conditional loop

### Comments

- `<critical>...</critical>`    # indicate a section of the document that is extremely important and must be followed
- `<important>...</important>`   # indicate a section of the document that is important and must be payed attentions
- `<note {kind}>...</note>`         # add a comment to the template of a specific type. This note should be removed from the resulting document
- kind is a hint of the type of the note, like: examples, comments.

## Execution Rules

1. slash command's argument hints will use variable syntax when defining arguments
2. slash command's will parse the arguments into the respective variables automatically according to the hint
3. Process assignments before control flow
4. Substitute `{variable}` with current values
5. Execute control blocks in document order

## Example

- Command: /create-products-for User Products

```markdown
---
allowed-tools: [Read, Write, Edit, Glob, Grep, Task, Bash, TodoWrite]
description: Creates an entity in the 
argument-hint: {user_name:string} {products:list of strings} {allow_duplicates:flag:optional(false)}
---
<foreach {product_name} in {products}>
Check if a product named {product_name} already exists in the `products` array property in the file called {user_name}.json
{entry_found:flag}=an entry was found.
<if ({entry_founden} and not {allow_duplicates})>
    <continue />
</if>
Add a new product entry named {product_name} in the `products` array property in the file called {user_name}.json
</foreach>
```

## Error Prevention & Best Practices

### ✅ Valid Control Flow Syntax

```markdown
<if ({variable_name})>...</if>                    # Flag variable evaluation
<if ({count} is greater than 0)>...</if>          # Comparison expression
<case {request_type}><is feature>...<is bug>...</case> # Case statement
<foreach {item} in {items}>...</foreach>          # Loop over collection
```

### ❌ inCORRECT Syntax (Common Errors)

```markdown
<if:VARIABLE_NAME>...</if>           # Wrong: uses : separator
<if (BARE_VARIABLE)>...</if>         # Wrong: missing braces around variable
<if {variable}>...</if>              # Wrong: missing parentheses
<foreach:ITEM>...</foreach>          # Wrong: uses : separator, missing in clause
<if ({var} = true)>...</if>          # Wrong: uses = instead of equals
```

### Variable Naming Standards

- **Template Constants**: `{SYSTEM_NAME}`, `{PROJECT_TYPE}` (UPPER_SNAKE_CASE)
- **Computed Flags**: `{has_frontend}`, `{is_enabled}` (lower_snake_case)
- **Command Arguments**: `{user_name}`, `{file_path}` (lower_snake_case)
- **All variables MUST use braces**: `{variable_name}` never `VARIABLE_NAME`

### Template Author Guidelines

1. Always test conditional logic with both true/false states
2. Use descriptive boolean names (`{has_frontend}` not `{FRONTEND}`)
3. Keep variable names consistent within the same template
4. Use parentheses for ALL conditions: `<if (condition)>`
5. Prefer explicit comparisons: `<if ({count} is greater than 0)>` over `<if ({count})>`
