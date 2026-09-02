import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Check, X, Lightbulb, ChevronRight, ChevronLeft, Plus, Trash2, KeyRound, Link2, Home, Flame, Award, Lock, BookOpen, Play, Terminal } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/*  "Drafting table" — a blueprint / architect's-sheet aesthetic.      */
/*  Ink-charcoal ground, faint grid, dashed measurement lines, amber   */
/*  pencil accent for progress, muted track colors for JS / Py / DB.   */
/* ------------------------------------------------------------------ */
const INK = "#12151A";
const SURFACE = "#1A1E25";
const SURFACE_2 = "#20242D";
const LINE = "#2A2F3A";
const TEXT = "#E7E9EC";
const SUBTEXT = "#8B93A1";
const AMBER = "#E8A33D";
const GOOD = "#5FBF7F";
const BAD = "#E0666B";

/* ------------------------------------------------------------------ */
/*  Glossary — tap any underlined term in a prompt, code block, or     */
/*  instruction panel to see a plain-language definition.              */
/* ------------------------------------------------------------------ */
const GLOSSARY = {
  "const": "Declares a JavaScript variable that can't be reassigned after it's set.",
  "let": "Declares a JavaScript variable that can be reassigned later, but not redeclared in the same scope.",
  "var": "An older way to declare variables in JavaScript, mostly replaced today by let and const.",
  "function": "A reusable block of code that performs a task and can be called by name.",
  "arrow function": "A shorter way to write a function in JavaScript, e.g. (a, b) => a + b.",
  "array": "An ordered list of values in JavaScript, accessed by numeric index starting at 0.",
  "object": "A collection of key-value pairs in JavaScript, used to group related data.",
  "boolean": "A data type with only two possible values: true and false.",
  "push": "An array method that adds one or more items to the end of the array.",
  "pop": "An array method that removes the last item from an array.",
  "map": "An array method that transforms every item and returns a new array of the same length.",
  "filter": "An array method that returns a new array containing only the items that pass a test.",
  "reduce": "An array method that combines every item into a single value, like a running total.",
  "for...of": "A loop that iterates directly over the values in an array or other iterable.",
  "def": "The keyword used to define a function in Python.",
  "dict": "Short for dictionary — Python's key-value data structure, similar to a JS object.",
  "list": "An ordered collection of values in Python, similar to a JS array.",
  "append": "A Python list method that adds one item to the end of the list.",
  "range": "A Python function that generates a sequence of numbers, often used in loops.",
  "sum": "A built-in Python function that adds up every number in a sequence.",
  "primary key": "A column that uniquely identifies each row in a table — no two rows can share it.",
  "foreign key": "A column that references the primary key of another table, linking the two together.",
  "table": "A structured set of rows and columns that stores one type of record in a database.",
  "column": "A single field shared by every row in a table, like 'name' or 'amount'.",
  "schema": "The overall structure of a database — its tables, columns, and how they relate.",
  "row": "A single record in a database table.",
  "integer": "A whole-number data type, with no decimal point.",
  "string": "A data type representing text.",
  "index": "A number identifying a position in an array or list, starting at 0.",
  "return": "The keyword that sends a value back out of a function to wherever it was called from.",
  "parameter": "A named placeholder in a function's definition that stands in for whatever value gets passed in when it's called.",
  "argument": "The actual value you pass into a function when calling it, filling in for one of its parameters.",
  "method": "A function that belongs to a particular value, like an array or string, called with dot notation — e.g. array.push().",
  "loop": "A block of code that repeats a set of instructions, either a fixed number of times or until a condition stops being true.",
  "iteration": "One single pass through a loop — running its instructions once for one item.",
  "scope": "The region of code where a variable can be used. A variable created inside a function usually can't be reached from outside it.",
  "class": "A reserved word in Python that can't be used as a variable name — it's used to define a blueprint for creating objects.",
  "keys": "In an object or dictionary, the labels used to look up each stored value.",
  "real": "A numeric database column type that can store decimals, unlike integer, which only holds whole numbers.",
  "text": "A database column type that stores free-form words or sentences.",
  "record": "Another name for a single row in a database table — one complete entry.",
  "field": "Another name for a column — one piece of information every record shares.",
  "condition": "An expression that evaluates to true or false, used to control whether a loop keeps running or a branch of code runs.",
  "increment": "To increase a value by a set amount, often by 1 — written as i++ in JavaScript.",
  "declare": "To create a new variable for the first time, giving it a name and often an initial value.",
  "call": "To run a function by writing its name followed by parentheses, e.g. greet().",
  "reassign": "To give an existing variable a new value, replacing whatever it held before.",
  "normalization": "Organizing a database so each piece of information lives in exactly one place, reducing duplication and the risk of it going out of sync.",
  "recursion": "When a function calls itself to solve a smaller version of the same problem, until it reaches a simple case it can answer directly.",
  "auto-incrementing": "A column that automatically assigns the next whole number each time a new row is added — commonly used for primary keys.",
  "print": "Python's built-in function for displaying output to the screen.",
};

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const GLOSSARY_KEYS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
const GLOSSARY_REGEX = new RegExp(`\\b(${GLOSSARY_KEYS.map(escapeRegExp).join("|")})\\b`, "gi");

function splitWithTerms(text) {
  const parts = [];
  let lastIndex = 0;
  let match;
  const re = new RegExp(GLOSSARY_REGEX.source, "gi");
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ text: text.slice(lastIndex, match.index), term: null });
    parts.push({ text: match[0], term: match[0].toLowerCase() });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), term: null });
  return parts;
}

function GlossaryText({ text, mono = false }) {
  const [openTerm, setOpenTerm] = useState(null);
  const parts = useMemo(() => splitWithTerms(text), [text]);

  return (
    <div>
      <span className={mono ? "font-mono whitespace-pre-wrap" : ""}>
        {parts.map((p, i) =>
          p.term && GLOSSARY[p.term] ? (
            <button
              key={i}
              onClick={() => setOpenTerm(openTerm === p.term ? null : p.term)}
              className="underline decoration-dotted underline-offset-4 decoration-1"
              style={{ color: openTerm === p.term ? AMBER : "inherit" }}
            >
              {p.text}
            </button>
          ) : (
            <React.Fragment key={i}>{p.text}</React.Fragment>
          )
        )}
      </span>
      {openTerm && GLOSSARY[openTerm] && (
        <div
          className="mt-2 flex items-start gap-2 rounded px-3 py-2 text-xs"
          style={{ background: SURFACE_2, border: `1px dashed ${LINE}`, color: SUBTEXT }}
        >
          <BookOpen size={13} style={{ color: AMBER, marginTop: 1, flexShrink: 0 }} />
          <div>
            <span className="font-mono" style={{ color: TEXT }}>{openTerm}</span>
            {" — "}{GLOSSARY[openTerm]}
          </div>
        </div>
      )}
    </div>
  );
}

/* Shown on the first page of every lesson: the lesson's key vocabulary,
   tappable regardless of whether those exact words appear in the questions. */
function TermsPanel({ terms, accent }) {
  const [open, setOpen] = useState(null);
  if (!terms || terms.length === 0) return null;

  return (
    <div className="relative rounded-md border px-5 py-4 mb-6" style={{ background: SURFACE, borderColor: LINE }}>
      <TickCorners color={accent} />
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.15em] mb-3" style={{ color: accent }}>
        <BookOpen size={13} /> key terms for this lesson
      </div>
      <div className="flex flex-wrap gap-2">
        {terms.map((t) => (
          <button
            key={t}
            onClick={() => setOpen(open === t ? null : t)}
            className="px-2.5 py-1 rounded-full text-xs font-mono border transition-colors"
            style={{
              borderColor: open === t ? accent : LINE,
              color: open === t ? accent : TEXT,
              background: open === t ? "rgba(232,163,61,0.08)" : SURFACE_2,
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {open && GLOSSARY[open] && (
        <div
          className="mt-3 flex items-start gap-2 rounded px-3 py-2 text-xs"
          style={{ background: SURFACE_2, border: `1px dashed ${LINE}`, color: SUBTEXT }}
        >
          <BookOpen size={13} style={{ color: accent, marginTop: 1, flexShrink: 0 }} />
          <div>
            <span className="font-mono" style={{ color: TEXT }}>{open}</span>
            {" — "}{GLOSSARY[open]}
          </div>
        </div>
      )}
    </div>
  );
}

/* Shown on the first page of every lesson: the underlying idea in plain
   language, before any vocabulary or quiz questions. */
function ConceptIntro({ concept, accent }) {
  if (!concept) return null;
  return (
    <div className="relative rounded-md border px-5 py-4 mb-4" style={{ background: SURFACE_2, borderColor: accent, borderStyle: "solid" }}>
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.15em] mb-2" style={{ color: accent }}>
        <Lightbulb size={13} /> the idea, in plain terms
      </div>
      <div className="text-sm leading-relaxed" style={{ color: TEXT }}>
        <GlossaryText text={concept} />
      </div>
    </div>
  );
}

const TRACKS_META = {
  js: { name: "JavaScript", tag: "sheet 01 — foundations", color: "#D9C74A" },
  py: { name: "Python", tag: "sheet 02 — foundations", color: "#6FA8DC" },
  db: { name: "Database Design", tag: "sheet 03 — schema & keys", color: "#8FBF7F" },
  project: { name: "Capstone: Claims Mini-System", tag: "sheet 04 — real-world project", color: "#E8A33D" },
};

/* ------------------------------------------------------------------ */
/*  Curriculum                                                         */
/* ------------------------------------------------------------------ */
const TRACKS = {
  js: [
    {
      title: "Variables & Types",
      terms: ["const", "let", "var", "boolean"],
      concept: "A variable is a labeled box that holds a value so your code can use it later. In JavaScript, you choose how strict the box is: const locks the value in for good, while let allows you to swap it out later. A type just describes what kind of thing is inside the box — a number, a word (string), or a yes/no (boolean).",
      questions: [
        { type: "mc", prompt: "Which keyword should you use for a value that should never change?",
          options: ["const", "let", "var", "def"], answer: "const",
          hints: ["Think about the word itself — 'constant'.", "It's the shortest of the three declaration keywords."] },
        { type: "fill", code: "___ x = 10; // x will be reassigned later in the program", answer: "let",
          hints: ["This keyword allows reassignment but not redeclaration in the same scope.", "It's newer than 'var' and is the modern default for reassignable values."] },
        { type: "mc", prompt: "What type is the value true in JavaScript?",
          options: ["boolean", "string", "number", "object"], answer: "boolean",
          hints: ["It's one of two possible values in this type.", "true / false"] },
      ],
    },
    {
      title: "Functions",
      terms: ["function", "arrow function"],
      concept: "A function is a mini-machine you build once and can run as many times as you want. You feed it inputs, called parameters, it does some work, and it can hand back a result. Instead of retyping the same steps everywhere, you just call the function by name — like a recipe card you can reuse instead of writing out the recipe from scratch each time.",
      questions: [
        { type: "fill", code: "function add(a, b) {\n  return a ___ b;\n}", answer: "+",
          hints: ["The function is named 'add'.", "It's a math operator."] },
        { type: "mc", prompt: "How do you call a function named greet with no arguments?",
          options: ["greet()", "call greet", "greet[]", "run greet()"], answer: "greet()",
          hints: ["You need parentheses, even if empty.", "Just the name followed by ()"] },
        { type: "mc", prompt: "Which of these is a valid arrow function that adds two numbers?",
          options: ["(a, b) => a + b", "(a, b) -> a + b", "a, b => { a + b }", "arrow(a, b) => a + b"], answer: "(a, b) => a + b",
          hints: ["Arrow functions use '=>' not '->'.", "Parameters go in parentheses before the arrow."] },
      ],
    },
    {
      title: "Arrays",
      terms: ["array", "push", "index"],
      concept: "An array is an ordered list — imagine a row of numbered mail slots. The first item sits in slot 0, the second in slot 1, and so on. You can add items, remove them, or grab one by its slot number, called its index.",
      questions: [
        { type: "mc", prompt: "Which array method adds an item to the end?",
          options: ["push", "pop", "shift", "unshift"], answer: "push",
          hints: ["The opposite of this method is 'pop'.", "Think of pushing something onto the end of a line."] },
        { type: "fill", code: "let nums = [1, 2, 3];\nnums.___(4); // nums is now [1, 2, 3, 4]", answer: "push",
          hints: ["Same method as the previous question.", "Adds to the end of the array."] },
        { type: "mc", prompt: "If nums = [10, 20, 30], what is nums[0]?",
          options: ["10", "20", "30", "undefined"], answer: "10",
          hints: ["Arrays are zero-indexed.", "Index 0 is the first item."] },
      ],
    },
    {
      title: "Objects",
      terms: ["object"],
      concept: "An object groups related information together using labeled fields — like a contact card with a name, a phone number, and an email. Instead of numbered slots like an array, you look things up by their label, not their position.",
      questions: [
        { type: "mc", prompt: "How do you access the name property of an object called person?",
          options: ["person.name", "person->name", "person::name", "person(name)"], answer: "person.name",
          hints: ["JavaScript uses dot notation for properties.", "It's object DOT property."] },
        { type: "fill", code: "let user = { age: ___ }; // set age to 25", answer: "25",
          hints: ["Just the number itself.", "The comment tells you the value."] },
        { type: "mc", prompt: "What does Object.keys(obj) return?",
          options: ["an array of the object's property names", "the object's values", "undefined", "the object itself"], answer: "an array of the object's property names",
          hints: ["It's about the keys, not the values.", "Returns a list, not a single value."] },
      ],
    },
    {
      title: "Loops",
      terms: ["for...of", "index"],
      concept: "Iteration means doing something over and over, once for each item. A loop is how code repeats an action without you retyping it — instead of writing 'print this number' five separate times, you tell the computer 'do this 5 times' and it handles the repetition. Each single pass through the loop is called one iteration.",
      questions: [
        { type: "fill", code: "for (let i = 0; i ___ 5; i++) {\n  console.log(i);\n}", answer: "<",
          hints: ["This is the loop's stopping condition.", "It's a comparison operator, not '='."] },
        { type: "mc", prompt: "Which loop is best for iterating directly over array items?",
          options: ["for...of", "while(true)", "goto", "switch"], answer: "for...of",
          hints: ["It gives you each value directly, not an index.", "Written as: for (const item of array)"] },
        { type: "mc", prompt: "How many times does 'for (let i = 0; i < 3; i++)' run?",
          options: ["3", "2", "4", "infinite"], answer: "3",
          hints: ["It runs for i = 0, 1, 2.", "Count from 0 up to (not including) 3."] },
      ],
    },
  ],
  py: [
    {
      title: "Variables & Types",
      terms: ["boolean", "string", "integer"],
      concept: "A variable is a named container for a value you can reuse later, like x = 7. Python figures out the type automatically based on what you put in it — a whole number, some text, or a true/false value — you don't have to declare it yourself.",
      questions: [
        { type: "mc", prompt: "Which of these is a valid Python variable name?",
          options: ["my_var", "2cool", "my-var", "class"], answer: "my_var",
          hints: ["Names can't start with a digit or contain hyphens.", "'class' is a reserved keyword."] },
        { type: "fill", code: "x = ___  # assign the number 7 to x", answer: "7",
          hints: ["Just the number itself.", "The comment tells you the value."] },
        { type: "mc", prompt: "What type is the value True in Python?",
          options: ["bool", "str", "int", "NoneType"], answer: "bool",
          hints: ["It's one of two possible values in this type.", "True / False"] },
      ],
    },
    {
      title: "Functions",
      terms: ["def", "function"],
      concept: "A function is a reusable block of instructions you define once with def and can call by name whenever you need it — like a recipe card you follow again and again instead of rewriting the steps every time you cook.",
      questions: [
        { type: "fill", code: "def add(a, b):\n    return a ___ b", answer: "+",
          hints: ["The function is named 'add'.", "It's a math operator."] },
        { type: "mc", prompt: "How do you define a function in Python?",
          options: ["def name():", "function name()", "func name{}", "method name()"], answer: "def name():",
          hints: ["Python's keyword for defining functions is short.", "It starts with 'def'."] },
        { type: "mc", prompt: "Which keyword sends a value back out of a function?",
          options: ["return", "give", "yield only", "output"], answer: "return",
          hints: ["It's the same keyword as many other languages use.", "return value"] },
      ],
    },
    {
      title: "Lists",
      terms: ["list", "append", "index"],
      concept: "A list is an ordered collection of values, just like a row of numbered mail slots. The first item lives at position 0, the second at position 1, and so on — you can look any item up by that position.",
      questions: [
        { type: "mc", prompt: "Which method adds an item to the end of a list?",
          options: ["append", "add", "push", "insert(0)"], answer: "append",
          hints: ["Python's word for 'add to the end'.", "list.append(item)"] },
        { type: "fill", code: "nums = [1, 2, 3]\nnums.___(4)  # nums is now [1, 2, 3, 4]", answer: "append",
          hints: ["Same method as the previous question.", "Adds to the end of the list."] },
        { type: "mc", prompt: "If nums = [10, 20, 30], what is nums[0]?",
          options: ["10", "20", "30", "Error"], answer: "10",
          hints: ["Lists are zero-indexed.", "Index 0 is the first item."] },
      ],
    },
    {
      title: "Dictionaries",
      terms: ["dict"],
      concept: "A dictionary stores information as labeled pairs — a key and its value — so you look things up by name instead of position, like a contact card with a 'name' field and an 'age' field rather than numbered slots.",
      questions: [
        { type: "mc", prompt: "How do you access the value for key 'name' in a dict called person?",
          options: ["person['name']", "person.name()", "person->name", "person{name}"], answer: "person['name']",
          hints: ["Dictionaries use square brackets with the key.", "person['key']"] },
        { type: "fill", code: "user = { 'age': ___ }  # set age to 25", answer: "25",
          hints: ["Just the number itself.", "The comment tells you the value."] },
        { type: "mc", prompt: "What does person.keys() return?",
          options: ["the dict's keys", "the dict's values", "a list of tuples", "nothing"], answer: "the dict's keys",
          hints: ["It's right there in the method name.", "Not values — the other thing."] },
      ],
    },
    {
      title: "Loops",
      terms: ["range", "list"],
      concept: "Iteration means repeating an action once for each item in a sequence. A for loop walks through a list — or a range of numbers — one item at a time, running the same instructions on each one. That single pass through one item is what programmers call an iteration.",
      questions: [
        { type: "fill", code: "for i in range(___):\n    print(i)  # prints 0, 1, 2, 3, 4", answer: "5",
          hints: ["range(n) stops before n.", "It needs to print 5 numbers, 0 through 4."] },
        { type: "mc", prompt: "Which loop iterates directly over each item in a list?",
          options: ["for item in list:", "while True:", "loop item:", "foreach item"], answer: "for item in list:",
          hints: ["Python's for-loop works directly over iterables.", "for item in my_list:"] },
        { type: "mc", prompt: "How many times does 'for i in range(3):' run?",
          options: ["3", "2", "4", "infinite"], answer: "3",
          hints: ["It runs for i = 0, 1, 2.", "range(3) produces 3 values."] },
      ],
    },
  ],
};

/* Database track has its own shape: mc lessons + two schema-builder lessons */
const DB_LESSONS = [
  {
    kind: "mc",
    title: "What Is a Table?",
    terms: ["table", "row", "column"],
    concept: "A database table is like a spreadsheet. Each row is one record — one customer, one order, one student. Each column is a piece of information every record shares, like 'name' or 'email'. The table itself is just the whole sheet, organized around one type of thing.",
    questions: [
      { type: "mc", prompt: "What does a row in a database table represent?",
        options: ["a single record", "a column name", "the whole table", "a data type"], answer: "a single record",
        hints: ["Think of a spreadsheet — a row is one entry.", "One row = one customer, one order, one student."] },
      { type: "mc", prompt: "What does a column define?",
        options: ["a field/attribute shared by all rows", "one single record", "the table's name", "only a foreign key"], answer: "a field/attribute shared by all rows",
        hints: ["Columns run vertically down every row.", "Every row has the same set of columns."] },
      { type: "mc", prompt: "Which is the best name for a table storing customer data?",
        options: ["customers", "Customer1", "data", "table2"], answer: "customers",
        hints: ["Clear, lowercase, plural names are the convention.", "It should describe what it holds."] },
    ],
  },
  {
    kind: "mc",
    title: "Primary Keys",
    terms: ["primary key", "table"],
    concept: "A primary key guarantees that every row can be told apart from every other row — like a social security number or an order number. It's a rule the database enforces: no two rows are ever allowed to share the same primary key value.",
    questions: [
      { type: "mc", prompt: "What is a primary key?",
        options: ["a unique identifier for each row", "any column in the table", "always the first column", "a password field"], answer: "a unique identifier for each row",
        hints: ["It guarantees you can tell rows apart.", "No two rows can share this value."] },
      { type: "mc", prompt: "Can two rows share the same primary key value?",
        options: ["No", "Yes", "Sometimes", "Only in small tables"], answer: "No",
        hints: ["That's the whole point of a primary key.", "Uniqueness is required."] },
      { type: "mc", prompt: "Which is commonly used as a primary key?",
        options: ["an auto-incrementing id", "the customer's name", "a comment field", "a boolean flag"], answer: "an auto-incrementing id",
        hints: ["Names can repeat — ids don't.", "A number that increases automatically per row."] },
    ],
  },
  {
    kind: "schema",
    title: "Build It: One Table",
    terms: ["table", "column", "primary key", "integer", "string"],
    concept: "Designing a table means deciding two things: what information every record needs to hold (its columns) and which column uniquely tells one record apart from another (its primary key). Get both of those right and the rest of the database builds on top of it.",
    instructions: "Create a students table with an id column (integer, primary key) and a name column (text).",
    requirement: {
      tables: [
        { name: "students", columns: [
          { name: "id", type: "integer", pk: true },
          { name: "name", type: "text" },
        ]},
      ],
    },
  },
  {
    kind: "mc",
    title: "Foreign Keys & Relationships",
    terms: ["foreign key", "primary key", "table"],
    concept: "A foreign key is how one table points to a row in another table — like writing someone's ID number on a form instead of rewriting their entire address every time. It's how databases connect related information across tables without duplicating it everywhere.",
    questions: [
      { type: "mc", prompt: "What does a foreign key do?",
        options: ["links a row to a row in another table", "deletes duplicate rows", "renames a column", "is always the primary key"], answer: "links a row to a row in another table",
        hints: ["It's how tables reference each other.", "It stores another table's primary key value."] },
      { type: "mc", prompt: "In a 'one student has many enrollments' relationship, where does the foreign key usually go?",
        options: ["on the enrollments table", "on the students table", "on neither table", "on both equally"], answer: "on the enrollments table",
        hints: ["The 'many' side holds the reference.", "Each enrollment points back to one student."] },
      { type: "mc", prompt: "Why avoid duplicating a customer's full address in every order row?",
        options: ["it wastes space and risks inconsistent copies", "SQL requires addresses in a separate file", "it makes every query faster automatically", "tables can only have one text column"], answer: "it wastes space and risks inconsistent copies",
        hints: ["Think about what happens when the customer moves.", "Duplicated data can drift out of sync."] },
    ],
  },
  {
    kind: "schema",
    title: "Build It: Related Tables",
    terms: ["table", "column", "primary key", "foreign key"],
    concept: "When two kinds of records are related — like students and the courses they take — you don't merge them into one messy table. You keep two clean tables and connect them with a foreign key, so each stays focused on one thing while still being linkable.",
    instructions: "Create a students table (id pk, name) and a courses table (id pk, title, and a student_id foreign key referencing students.id).",
    requirement: {
      tables: [
        { name: "students", columns: [
          { name: "id", type: "integer", pk: true },
          { name: "name", type: "text" },
        ]},
        { name: "courses", columns: [
          { name: "id", type: "integer", pk: true },
          { name: "title", type: "text" },
          { name: "student_id", type: "integer", fk: { table: "students", column: "id" } },
        ]},
      ],
    },
  },
];

/*
 * Capstone project — a single narrative that runs across all three skills:
 * design the schema, then query and manipulate that data in JS and Python.
 * Deliberately themed around a small claims/patient system since it's close
 * to real work, but fully generic/fictional — no real data involved.
 */
const PROJECT_LESSONS = [
  {
    kind: "schema",
    title: "Step 1 — Design the Schema",
    terms: ["table", "column", "primary key", "foreign key"],
    concept: "Every real application starts with the same question a database designer asks: what are the 'things' in this system, and how do they relate? Here, patients and claims are two different things, so they get two tables — linked by a foreign key rather than crammed into one.",
    instructions: "You're building a tiny claims tracker. Create a patients table (id pk, name text) and a claims table (id pk, amount real, status text, and a patient_id foreign key referencing patients.id).",
    requirement: {
      tables: [
        { name: "patients", columns: [
          { name: "id", type: "integer", pk: true },
          { name: "name", type: "text" },
        ]},
        { name: "claims", columns: [
          { name: "id", type: "integer", pk: true },
          { name: "amount", type: "real" },
          { name: "status", type: "text" },
          { name: "patient_id", type: "integer", fk: { table: "patients", column: "id" } },
        ]},
      ],
    },
  },
  {
    kind: "quiz",
    title: "Step 2 — Query It in JavaScript",
    terms: ["array", "filter", "reduce", "map"],
    concept: "filter, map, and reduce are all specialized loops — instead of writing 'for each item, do X' by hand, these built-in methods iterate over the array for you and let you just describe what to do with each item as it goes by.",
    questions: [
      { type: "fill", code: "// claims is an array of { id, amount, status, patientId }\nconst approved = claims.___(c => c.status === 'approved');", answer: "filter",
        hints: ["You want to keep only the claims that match a condition.", "It returns a new array containing only matching items."] },
      { type: "fill", code: "const total = claims.reduce((sum, c) => sum ___ c.amount, 0);", answer: "+",
        hints: ["You're accumulating a running total.", "It's a math operator."] },
      { type: "mc", prompt: "Which array method would you use to turn each claim into just { id, amount }?",
        options: ["map", "filter", "reduce", "find"], answer: "map",
        hints: ["You're reshaping every item, not removing any.", "It returns a new array of the same length, transformed."] },
    ],
  },
  {
    kind: "quiz",
    title: "Step 3 — Query It in Python",
    terms: ["dict", "list", "sum"],
    concept: "A list comprehension is Python's compact way of writing a loop that builds a new list — 'for each item, keep it if it matches, and put the result in a new list' all in one line, instead of a separate for loop with an if inside it.",
    questions: [
      { type: "fill", code: "# claims is a list of dicts: {'id', 'amount', 'status', 'patient_id'}\napproved = [c for c in claims if c['status'] ___ 'approved']", answer: "==",
        hints: ["You're comparing values, not assigning one.", "Equality in Python uses two equals signs."] },
      { type: "fill", code: "total = ___(c['amount'] for c in claims)", answer: "sum",
        hints: ["Python has a built-in for exactly this.", "It adds up every value in the sequence."] },
      { type: "mc", prompt: "Which Python structure best represents one claim record?",
        options: ["a dict", "a set", "a tuple of functions", "a class method"], answer: "a dict",
        hints: ["You need named fields like 'amount' and 'status'.", "Key-value pairs — just like a row from the database."] },
    ],
  },
  {
    kind: "quiz",
    title: "Step 4 — Connect the Pieces",
    terms: ["foreign key", "primary key", "schema"],
    concept: "The schema, the JavaScript, and the Python aren't three separate skills — they're three views of the same system. The schema decides what's stored and how it's connected; your code decides what questions to ask of that stored data. Neither one works well without the other.",
    questions: [
      { type: "mc", prompt: "Why does claims.patient_id reference patients.id instead of storing the patient's name directly on each claim?",
        options: ["so patient data lives in one place and stays consistent", "because SQL doesn't allow text in the claims table", "it makes every query run faster automatically", "foreign keys are only cosmetic"], answer: "so patient data lives in one place and stays consistent",
        hints: ["Think about what happens if a patient's name is misspelled or changes.", "This is the same idea from the database track's foreign key lesson."] },
      { type: "mc", prompt: "You want the total approved-claim amount for one specific patient. What's the right order of operations?",
        options: ["filter by patient and status, then sum the remaining amounts", "sum everything first, then filter", "sort by amount, then filter", "there's no way to do this without a new table"], answer: "filter by patient and status, then sum the remaining amounts",
        hints: ["Narrow down to the rows you care about before combining them.", "Filter first, then reduce/sum."] },
      { type: "mc", prompt: "In a real application, which part actually talks to the database — the database itself, or your JS/Python application code?",
        options: ["the application code queries the database", "the database pushes updates into the code automatically", "they never communicate directly", "only JavaScript can query databases"], answer: "the application code queries the database",
        hints: ["The schema just stores and organizes data.", "Your code is what asks the database for what it needs."] },
    ],
  },
  {
    kind: "schema",
    title: "Step 5 — Extend the System",
    terms: ["table", "primary key", "foreign key"],
    concept: "Real systems grow. Adding a new kind of 'thing' — providers, in this case — almost always means adding a new table and a new foreign key, not bolting extra columns onto an existing table. That's what keeps a schema clean as it scales.",
    instructions: "Claims come from providers too. Rebuild the schema with three tables: patients (id pk, name text), providers (id pk, name text), and claims (id pk, amount real, status text, patient_id fk → patients.id, and provider_id fk → providers.id).",
    requirement: {
      tables: [
        { name: "patients", columns: [
          { name: "id", type: "integer", pk: true },
          { name: "name", type: "text" },
        ]},
        { name: "providers", columns: [
          { name: "id", type: "integer", pk: true },
          { name: "name", type: "text" },
        ]},
        { name: "claims", columns: [
          { name: "id", type: "integer", pk: true },
          { name: "amount", type: "real" },
          { name: "status", type: "text" },
          { name: "patient_id", type: "integer", fk: { table: "patients", column: "id" } },
          { name: "provider_id", type: "integer", fk: { table: "providers", column: "id" } },
        ]},
      ],
    },
  },
];

const XP_PER_LESSON = 20;
const COLUMN_TYPES = ["integer", "text", "real", "boolean", "date"];

/* ------------------------------------------------------------------ */
/*  Blueprint chrome                                                   */
/* ------------------------------------------------------------------ */
function GridBackdrop() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    />
  );
}

function TickCorners({ color }) {
  const style = { borderColor: color };
  return (
    <>
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={style} />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={style} />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={style} />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={style} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */
/* Groups the same GLOSSARY entries by track for the standalone glossary page. */
const GLOSSARY_CATEGORIES = [
  { id: "js", label: "JavaScript", color: "#D9C74A", terms: ["const", "let", "var", "function", "arrow function", "array", "object", "push", "pop", "map", "filter", "reduce", "for...of"] },
  { id: "py", label: "Python", color: "#6FA8DC", terms: ["def", "dict", "list", "append", "range", "sum", "class", "print"] },
  { id: "db", label: "Database Design", color: "#8FBF7F", terms: ["primary key", "foreign key", "table", "column", "schema", "row", "real", "text", "record", "field", "auto-incrementing", "normalization"] },
  { id: "general", label: "General Programming", color: "#E8A33D", terms: ["boolean", "string", "integer", "index", "return", "parameter", "argument", "method", "loop", "iteration", "scope", "condition", "increment", "declare", "call", "reassign", "recursion", "keys"] },
];

function GlossaryPage({ onBack }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <button onClick={onBack} className="flex items-center gap-1 text-xs font-mono mb-6" style={{ color: SUBTEXT }}>
        <Home size={13} /> workbench
      </button>

      <div className="text-xs tracking-[0.2em] uppercase font-mono mb-2" style={{ color: SUBTEXT }}>
        reference sheet
      </div>
      <h1 className="text-2xl font-mono font-semibold mb-6" style={{ color: TEXT }}>Glossary</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="search terms…"
        className="w-full px-4 py-2.5 rounded-md border font-mono text-sm outline-none mb-8"
        style={{ background: SURFACE_2, borderColor: LINE, color: TEXT }}
      />

      <div className="space-y-8">
        {GLOSSARY_CATEGORIES.map((cat) => {
          const items = cat.terms
            .filter((t) => GLOSSARY[t])
            .filter((t) => !q || t.toLowerCase().includes(q) || GLOSSARY[t].toLowerCase().includes(q));
          if (items.length === 0) return null;
          return (
            <div key={cat.id}>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.15em] mb-3" style={{ color: cat.color }}>
                <BookOpen size={13} /> {cat.label}
              </div>
              <div className="space-y-2">
                {items.map((t) => (
                  <div key={t} className="relative rounded-md border px-4 py-3" style={{ background: SURFACE, borderColor: LINE }}>
                    <TickCorners color={cat.color} />
                    <div className="font-mono text-sm mb-1" style={{ color: cat.color }}>{t}</div>
                    <div className="text-xs leading-relaxed" style={{ color: SUBTEXT }}>{GLOSSARY[t]}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {GLOSSARY_CATEGORIES.every((cat) => cat.terms.filter((t) => GLOSSARY[t]).filter((t) => !q || t.toLowerCase().includes(q) || GLOSSARY[t].toLowerCase().includes(q)).length === 0) && (
          <p className="text-sm" style={{ color: SUBTEXT }}>No terms match "{query}".</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Live code sandbox                                                  */
/*  JS runs natively in the browser. Python runs via Pyodide (a        */
/*  WebAssembly build of CPython) loaded lazily from a CDN the first   */
/*  time the Python tab is used.                                       */
/* ------------------------------------------------------------------ */
const PYODIDE_VERSION = "0.26.4";
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

const STARTERS = {
  js: [
    {
      label: "Hello world",
      code: `console.log("Hello, world!");`,
    },
    {
      label: "Variables",
      code: `const name = "Lavi";\nlet count = 3;\ncount = count + 1;\n\nconsole.log(name, "has", count, "items");`,
    },
    {
      label: "A function",
      code: `function add(a, b) {\n  return a + b;\n}\n\nconsole.log(add(2, 3));\nconsole.log(add(10, 5));`,
    },
    {
      label: "Loop over an array",
      code: `const nums = [10, 20, 30];\n\nfor (const n of nums) {\n  console.log("value:", n);\n}\n\nconsole.log("total items:", nums.length);`,
    },
    {
      label: "filter / map / reduce",
      code: `const claims = [\n  { id: 1, amount: 120, status: "approved" },\n  { id: 2, amount: 300, status: "denied" },\n  { id: 3, amount: 80,  status: "approved" },\n];\n\nconst approved = claims.filter(c => c.status === "approved");\nconsole.log("approved count:", approved.length);\n\nconst total = approved.reduce((sum, c) => sum + c.amount, 0);\nconsole.log("approved total:", total);`,
    },
  ],
  py: [
    {
      label: "Hello world",
      code: `print("Hello, world!")`,
    },
    {
      label: "Variables",
      code: `name = "Lavi"\ncount = 3\ncount = count + 1\n\nprint(name, "has", count, "items")`,
    },
    {
      label: "A function",
      code: `def add(a, b):\n    return a + b\n\nprint(add(2, 3))\nprint(add(10, 5))`,
    },
    {
      label: "Loop over a list",
      code: `nums = [10, 20, 30]\n\nfor n in nums:\n    print("value:", n)\n\nprint("total items:", len(nums))`,
    },
    {
      label: "Filtering dicts",
      code: `claims = [\n    {"id": 1, "amount": 120, "status": "approved"},\n    {"id": 2, "amount": 300, "status": "denied"},\n    {"id": 3, "amount": 80,  "status": "approved"},\n]\n\napproved = [c for c in claims if c["status"] == "approved"]\nprint("approved count:", len(approved))\n\ntotal = sum(c["amount"] for c in approved)\nprint("approved total:", total)`,
    },
  ],
};

function SandboxPage({ onBack }) {
  const [lang, setLang] = useState("js");
  const [code, setCode] = useState(STARTERS.js[0].code);
  const [output, setOutput] = useState([]);
  const [running, setRunning] = useState(false);
  const [pyStatus, setPyStatus] = useState("idle"); // idle | loading | ready | failed
  const pyodideRef = useRef(null);

  const accent = lang === "js" ? TRACKS_META.js.color : TRACKS_META.py.color;

  const switchLang = (next) => {
    setLang(next);
    setCode(STARTERS[next][0].code);
    setOutput([]);
  };

  const loadPyodide = useCallback(async () => {
    if (pyodideRef.current) return pyodideRef.current;
    setPyStatus("loading");
    try {
      if (!window.loadPyodide) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = `${PYODIDE_BASE}pyodide.js`;
          script.onload = resolve;
          script.onerror = () => reject(new Error("script failed to load"));
          document.head.appendChild(script);
        });
      }
      const py = await window.loadPyodide({ indexURL: PYODIDE_BASE });
      pyodideRef.current = py;
      setPyStatus("ready");
      return py;
    } catch (e) {
      setPyStatus("failed");
      return null;
    }
  }, []);

  const runJs = () => {
    const lines = [];
    const fmt = (v) => {
      if (typeof v === "string") return v;
      if (v === undefined) return "undefined";
      if (v === null) return "null";
      try { return JSON.stringify(v); } catch { return String(v); }
    };
    const fakeConsole = {
      log: (...args) => lines.push({ type: "log", text: args.map(fmt).join(" ") }),
      error: (...args) => lines.push({ type: "error", text: args.map(fmt).join(" ") }),
      warn: (...args) => lines.push({ type: "log", text: args.map(fmt).join(" ") }),
      info: (...args) => lines.push({ type: "log", text: args.map(fmt).join(" ") }),
    };
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function("console", `"use strict";\n${code}`);
      fn(fakeConsole);
      if (lines.length === 0) lines.push({ type: "muted", text: "(ran with no output — try adding a console.log)" });
    } catch (err) {
      lines.push({ type: "error", text: `${err.name}: ${err.message}` });
    }
    setOutput(lines);
  };

  const runPy = async () => {
    const py = await loadPyodide();
    if (!py) {
      setOutput([{ type: "error", text: "Couldn't load the Python engine. Check your connection, or try the JavaScript tab." }]);
      return;
    }
    const lines = [];
    py.setStdout({ batched: (s) => lines.push({ type: "log", text: s }) });
    py.setStderr({ batched: (s) => lines.push({ type: "error", text: s }) });
    try {
      await py.runPythonAsync(code);
      if (lines.length === 0) lines.push({ type: "muted", text: "(ran with no output — try adding a print())" });
    } catch (err) {
      lines.push({ type: "error", text: String(err.message || err).split("\n").slice(-6).join("\n") });
    }
    setOutput(lines);
  };

  const run = async () => {
    setRunning(true);
    setOutput([]);
    try {
      if (lang === "js") runJs();
      else await runPy();
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <button onClick={onBack} className="flex items-center gap-1 text-xs font-mono mb-6" style={{ color: SUBTEXT }}>
        <Home size={13} /> workbench
      </button>

      <div className="text-xs tracking-[0.2em] uppercase font-mono mb-2" style={{ color: SUBTEXT }}>
        scratch sheet
      </div>
      <h1 className="text-2xl font-mono font-semibold mb-1" style={{ color: TEXT }}>Sandbox</h1>
      <p className="text-sm mb-6" style={{ color: SUBTEXT }}>
        Write real code and run it. Nothing here affects your progress — break things freely.
      </p>

      {/* Language toggle */}
      <div className="flex gap-2 mb-4">
        {["js", "py"].map((id) => (
          <button
            key={id}
            onClick={() => switchLang(id)}
            className="px-4 py-2 rounded-md border font-mono text-xs"
            style={{
              background: lang === id ? "rgba(255,255,255,0.04)" : SURFACE,
              borderColor: lang === id ? TRACKS_META[id].color : LINE,
              color: lang === id ? TRACKS_META[id].color : SUBTEXT,
            }}
          >
            {TRACKS_META[id].name}
          </button>
        ))}
      </div>

      {/* Starter snippets */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STARTERS[lang].map((s) => (
          <button
            key={s.label}
            onClick={() => { setCode(s.code); setOutput([]); }}
            className="px-2.5 py-1 rounded-full text-xs font-mono border"
            style={{ background: SURFACE_2, borderColor: LINE, color: SUBTEXT }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="relative rounded-md border mb-3" style={{ background: SURFACE, borderColor: LINE }}>
        <TickCorners color={accent} />
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          rows={12}
          className="w-full px-4 py-4 bg-transparent font-mono text-sm outline-none resize-y"
          style={{ color: TEXT, lineHeight: 1.6 }}
        />
      </div>

      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={run}
          disabled={running}
          className="px-5 py-2.5 rounded-md font-mono text-sm flex items-center gap-2 disabled:opacity-60"
          style={{ background: accent, color: INK }}
        >
          <Play size={14} /> {running ? "running…" : "run code"}
        </button>
        {lang === "py" && pyStatus === "loading" && (
          <span className="text-xs font-mono" style={{ color: SUBTEXT }}>
            loading Python engine (first run only, ~10s)…
          </span>
        )}
        {lang === "py" && pyStatus === "ready" && (
          <span className="text-xs font-mono" style={{ color: GOOD }}>Python engine ready</span>
        )}
      </div>

      {/* Output */}
      <div className="text-[10px] font-mono uppercase tracking-[0.15em] mb-2" style={{ color: SUBTEXT }}>
        output
      </div>
      <div
        className="rounded-md border px-4 py-3 font-mono text-sm min-h-[100px] whitespace-pre-wrap break-words"
        style={{ background: SURFACE_2, borderColor: LINE, color: TEXT }}
      >
        {output.length === 0 ? (
          <span style={{ color: SUBTEXT }}>Run your code to see output here.</span>
        ) : (
          output.map((line, i) => (
            <div
              key={i}
              style={{ color: line.type === "error" ? BAD : line.type === "muted" ? SUBTEXT : TEXT }}
            >
              {line.text}
            </div>
          ))
        )}
      </div>

      <p className="text-xs mt-4" style={{ color: SUBTEXT }}>
        Tip: errors are normal. Read the message — it usually names the line and what went wrong.
      </p>
    </div>
  );
}

function Dashboard({ progress, xp, streak, onOpenTrack, onOpenGlossary, onOpenSandbox }) {
  const trackIds = ["js", "py", "db", "project"];
  const lessonCounts = { js: TRACKS.js.length, py: TRACKS.py.length, db: DB_LESSONS.length, project: PROJECT_LESSONS.length };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <div className="text-xs tracking-[0.2em] uppercase font-mono mb-2" style={{ color: SUBTEXT }}>
            drafting table — personal practice set
          </div>
          <h1 className="text-3xl font-mono font-semibold" style={{ color: TEXT }}>
            Workbench
          </h1>
          <p className="mt-2 text-sm" style={{ color: SUBTEXT }}>
            Three sheets. Beginner level. Work through each at your own pace.
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <button
            onClick={onOpenSandbox}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md border font-mono text-xs"
            style={{ background: SURFACE, borderColor: LINE, color: AMBER }}
          >
            <Terminal size={14} /> sandbox
          </button>
          <button
            onClick={onOpenGlossary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md border font-mono text-xs"
            style={{ background: SURFACE, borderColor: LINE, color: AMBER }}
          >
            <BookOpen size={14} /> glossary
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-10">
        <div className="flex-1 rounded-md px-4 py-3 border" style={{ background: SURFACE, borderColor: LINE }}>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide" style={{ color: SUBTEXT }}>
            <Award size={14} style={{ color: AMBER }} /> total xp
          </div>
          <div className="text-2xl font-mono mt-1" style={{ color: TEXT }}>{xp}</div>
        </div>
        <div className="flex-1 rounded-md px-4 py-3 border" style={{ background: SURFACE, borderColor: LINE }}>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide" style={{ color: SUBTEXT }}>
            <Flame size={14} style={{ color: AMBER }} /> lesson streak
          </div>
          <div className="text-2xl font-mono mt-1" style={{ color: TEXT }}>{streak}</div>
        </div>
      </div>

      <div className="space-y-5">
        {trackIds.map((id) => {
          const meta = TRACKS_META[id];
          const total = lessonCounts[id];
          const done = Object.keys(progress[id] || {}).length;
          const foundationsDone = ["js", "py", "db"].every(
            (fid) => Object.keys(progress[fid] || {}).length === lessonCounts[fid]
          );
          const locked = id === "project" && !foundationsDone;

          return (
            <button
              key={id}
              disabled={locked}
              onClick={() => onOpenTrack(id)}
              className="w-full text-left relative rounded-md border px-6 py-5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-white/[0.02]"
              style={{ background: SURFACE, borderColor: LINE }}
            >
              <TickCorners color={meta.color} />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.15em]" style={{ color: meta.color }}>
                    {meta.tag}
                  </div>
                  <div className="text-lg font-mono mt-1" style={{ color: TEXT }}>{meta.name}</div>
                  {locked && (
                    <div className="text-xs mt-1 flex items-center gap-1.5" style={{ color: SUBTEXT }}>
                      <Lock size={11} /> unlocks after finishing JS, Python & Database Design
                    </div>
                  )}
                </div>
                {locked ? <Lock size={18} style={{ color: SUBTEXT }} /> : <ChevronRight size={20} style={{ color: SUBTEXT }} />}
              </div>
              {!locked && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: LINE }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(done / total) * 100}%`, background: meta.color }}
                    />
                  </div>
                  <span className="text-xs font-mono" style={{ color: SUBTEXT }}>{done}/{total}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Track view (lesson list)                                           */
/* ------------------------------------------------------------------ */
function TrackView({ trackId, progress, onOpenLesson, onBack, onMarkAllComplete, onResetTrack }) {
  const meta = TRACKS_META[trackId];
  const lessons = trackId === "db" ? DB_LESSONS : trackId === "project" ? PROJECT_LESSONS : TRACKS[trackId];
  const done = progress[trackId] || {};
  const anyDone = Object.keys(done).length > 0;
  const allDone = lessons.every((_, i) => !!done[i]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <button onClick={onBack} className="flex items-center gap-1 text-xs font-mono mb-8" style={{ color: SUBTEXT }}>
        <Home size={13} /> workbench
      </button>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] mb-2" style={{ color: meta.color }}>
            {meta.tag}
          </div>
          <h1 className="text-2xl font-mono font-semibold" style={{ color: TEXT }}>{meta.name}</h1>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          {!allDone && (
            <button
              onClick={() => onMarkAllComplete(trackId)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md border font-mono text-xs"
              style={{ background: SURFACE, borderColor: LINE, color: SUBTEXT }}
            >
              <Check size={13} /> mark all complete
            </button>
          )}
          {anyDone && (
            <button
              onClick={() => onResetTrack(trackId)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md border font-mono text-xs"
              style={{ background: SURFACE, borderColor: LINE, color: BAD }}
            >
              <X size={13} /> reset sheet
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {lessons.map((lesson, i) => {
          const isDone = !!done[i];
          const locked = i > 0 && !done[i - 1] && !isDone;
          return (
            <button
              key={i}
              disabled={locked}
              onClick={() => onOpenLesson(i)}
              className="w-full flex items-center gap-4 text-left rounded-md border px-5 py-4 transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-white/[0.02]"
              style={{ background: SURFACE, borderColor: LINE }}
            >
              <div
                className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center border font-mono text-xs"
                style={{
                  borderColor: isDone ? GOOD : meta.color,
                  color: isDone ? GOOD : meta.color,
                  background: isDone ? "rgba(95,191,127,0.1)" : "transparent",
                }}
              >
                {isDone ? <Check size={13} /> : String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1">
                <div className="font-mono text-sm" style={{ color: TEXT }}>{lesson.title}</div>
                <div className="text-xs mt-0.5" style={{ color: SUBTEXT }}>
                  {lesson.kind === "schema" ? "schema builder" : `${lesson.questions.length} questions`}
                </div>
              </div>
              {!locked && <ChevronRight size={16} style={{ color: SUBTEXT }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz lesson runner                                                 */
/* ------------------------------------------------------------------ */
function QuizLesson({ lesson, accent, onComplete, onBack }) {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [fillValue, setFillValue] = useState("");
  const [status, setStatus] = useState(null); // null | 'correct' | 'wrong' | 'revealed'
  const [wrongAny, setWrongAny] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const MAX_ATTEMPTS = 3;
  const q = lesson.questions[qIndex];
  const why = q.hints.join(" ");

  const check = (value) => {
    const norm = (s) => String(s).trim().toLowerCase();
    const correct = norm(value) === norm(q.answer);
    if (correct) {
      setStatus("correct");
      return;
    }
    setWrongAny(true);
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setStatus(nextAttempts >= MAX_ATTEMPTS ? "revealed" : "wrong");
  };

  const next = () => {
    if (qIndex + 1 < lesson.questions.length) {
      setQIndex(qIndex + 1);
      setSelected(null);
      setFillValue("");
      setStatus(null);
      setAttempts(0);
    } else {
      onComplete(!wrongAny);
    }
  };

  const locked = status === "correct" || status === "revealed";

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <button onClick={onBack} className="flex items-center gap-1 text-xs font-mono mb-6" style={{ color: SUBTEXT }}>
        <ChevronLeft size={13} /> back to sheet
      </button>

      <div className="flex items-center justify-between mb-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.15em]" style={{ color: accent }}>
          {lesson.title}
        </div>
        <div className="text-xs font-mono" style={{ color: SUBTEXT }}>
          {qIndex + 1} / {lesson.questions.length}
        </div>
      </div>

      {qIndex === 0 && <ConceptIntro concept={lesson.concept} accent={accent} />}
      {qIndex === 0 && <TermsPanel terms={lesson.terms} accent={accent} />}

      <div className="relative rounded-md border px-6 py-8" style={{ background: SURFACE, borderColor: LINE }}>
        <TickCorners color={accent} />

        {q.type === "mc" && (
          <>
            <div className="text-base mb-1" style={{ color: TEXT }}>
              <GlossaryText text={q.prompt} />
            </div>
            <p className="text-[11px] font-mono mb-5" style={{ color: SUBTEXT }}>tap an underlined word for its definition</p>
            <div className="space-y-2">
              {q.options.map((opt) => {
                const isSelected = selected === opt;
                const isAnswer = opt === q.answer;
                const reveal = status === "revealed" && isAnswer;
                const showWrongSelection = status !== "correct" && status !== "revealed" && isSelected;
                const showCorrectSelection = status === "correct" && isSelected;
                return (
                  <button
                    key={opt}
                    disabled={locked}
                    onClick={() => { setSelected(opt); check(opt); }}
                    className="w-full text-left px-4 py-3 rounded border font-mono text-sm transition-colors"
                    style={{
                      borderColor: showCorrectSelection || reveal ? GOOD : showWrongSelection ? BAD : LINE,
                      background: showCorrectSelection || reveal ? "rgba(95,191,127,0.08)" : showWrongSelection ? "rgba(224,102,107,0.08)" : SURFACE_2,
                      color: TEXT,
                    }}
                  >
                    {opt}
                    {reveal && <span className="ml-2 text-xs" style={{ color: GOOD }}>← correct answer</span>}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {q.type === "fill" && (
          <>
            <p className="text-xs uppercase tracking-wide mb-3 font-mono" style={{ color: SUBTEXT }}>fill in the blank · tap an underlined word for its definition</p>
            <div className="rounded p-4 mb-6 text-sm" style={{ background: SURFACE_2, color: TEXT, border: `1px solid ${LINE}` }}>
              <GlossaryText text={q.code} mono />
            </div>
            <div className="flex gap-2">
              <input
                value={fillValue}
                onChange={(e) => setFillValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !locked) check(fillValue); }}
                disabled={locked}
                placeholder="type the missing piece"
                className="flex-1 px-3 py-2 rounded border font-mono text-sm outline-none"
                style={{
                  background: SURFACE_2,
                  borderColor: status === "wrong" ? BAD : status === "correct" ? GOOD : status === "revealed" ? GOOD : LINE,
                  color: TEXT,
                }}
              />
              {!locked && (
                <button
                  onClick={() => check(fillValue)}
                  className="px-4 py-2 rounded font-mono text-sm"
                  style={{ background: accent, color: INK }}
                >
                  check
                </button>
              )}
            </div>
          </>
        )}

        {status === "wrong" && (
          <div className="mt-5 rounded px-3 py-3 text-sm" style={{ background: "rgba(224,102,107,0.08)" }}>
            <div className="flex items-start gap-2" style={{ color: BAD }}>
              <X size={16} className="shrink-0 mt-0.5" />
              <span>Not quite — try again. ({MAX_ATTEMPTS - attempts} {MAX_ATTEMPTS - attempts === 1 ? "try" : "tries"} left before the answer is revealed)</span>
            </div>
            <div className="mt-2 pl-6 text-xs leading-relaxed" style={{ color: SUBTEXT }}>
              <span className="font-mono" style={{ color: TEXT }}>Why it's wrong: </span>
              <GlossaryText text={why} />
            </div>
          </div>
        )}
        {status === "correct" && (
          <div className="mt-5 rounded px-3 py-3 text-sm" style={{ background: "rgba(95,191,127,0.08)" }}>
            <div className="flex items-center gap-2" style={{ color: GOOD }}>
              <Check size={16} /> Correct.
            </div>
            <div className="mt-2 pl-6 text-xs leading-relaxed" style={{ color: SUBTEXT }}>
              <span className="font-mono" style={{ color: TEXT }}>Why it's right: </span>
              <GlossaryText text={why} />
            </div>
          </div>
        )}
        {status === "revealed" && (
          <div className="mt-5 rounded px-3 py-3 text-sm" style={{ background: "rgba(95,191,127,0.08)", color: GOOD }}>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide mb-1.5">
              <Lightbulb size={14} /> the answer is: {q.answer}
            </div>
            <div className="text-xs leading-relaxed" style={{ color: SUBTEXT }}>
              <span className="font-mono" style={{ color: TEXT }}>Why: </span>
              <GlossaryText text={why} />
            </div>
          </div>
        )}
      </div>

      {locked && (
        <button
          onClick={next}
          className="mt-6 w-full py-3 rounded font-mono text-sm flex items-center justify-center gap-2"
          style={{ background: accent, color: INK }}
        >
          {qIndex + 1 < lesson.questions.length ? "next question" : "finish lesson"} <ChevronRight size={15} />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Schema builder lesson                                              */
/* ------------------------------------------------------------------ */
function SchemaLesson({ lesson, accent, onComplete, onBack }) {
  const [tables, setTables] = useState([]);
  const [newTableName, setNewTableName] = useState("");
  const [result, setResult] = useState(null); // null | {ok, details}

  const addTable = () => {
    const name = newTableName.trim();
    if (!name) return;
    setTables([...tables, { id: crypto.randomUUID(), name, columns: [] }]);
    setNewTableName("");
  };

  const removeTable = (id) => setTables(tables.filter((t) => t.id !== id));

  const addColumn = (tableId) => {
    setTables(tables.map((t) => t.id === tableId
      ? { ...t, columns: [...t.columns, { id: crypto.randomUUID(), name: "", type: "text", pk: false, fkTable: "", fkColumn: "" }] }
      : t));
  };

  const updateColumn = (tableId, colId, patch) => {
    setTables(tables.map((t) => t.id === tableId
      ? { ...t, columns: t.columns.map((c) => c.id === colId ? { ...c, ...patch } : c) }
      : t));
  };

  const removeColumn = (tableId, colId) => {
    setTables(tables.map((t) => t.id === tableId ? { ...t, columns: t.columns.filter((c) => c.id !== colId) } : t));
  };

  const validate = () => {
    const norm = (s) => String(s).trim().toLowerCase();
    const missing = [];
    for (const reqTable of lesson.requirement.tables) {
      const userTable = tables.find((t) => norm(t.name) === norm(reqTable.name));
      if (!userTable) { missing.push(`no table named "${reqTable.name}"`); continue; }
      for (const reqCol of reqTable.columns) {
        const userCol = userTable.columns.find((c) => norm(c.name) === norm(reqCol.name));
        if (!userCol) { missing.push(`"${reqTable.name}" is missing column "${reqCol.name}"`); continue; }
        if (norm(userCol.type) !== norm(reqCol.type)) {
          missing.push(`"${reqTable.name}.${reqCol.name}" should be type ${reqCol.type}`);
        }
        if (reqCol.pk && !userCol.pk) {
          missing.push(`"${reqTable.name}.${reqCol.name}" should be marked as the primary key`);
        }
        if (reqCol.fk) {
          if (norm(userCol.fkTable) !== norm(reqCol.fk.table) || norm(userCol.fkColumn) !== norm(reqCol.fk.column)) {
            missing.push(`"${reqTable.name}.${reqCol.name}" should reference ${reqCol.fk.table}.${reqCol.fk.column}`);
          }
        }
      }
    }
    setResult(missing.length === 0 ? { ok: true } : { ok: false, details: missing });
    return missing.length === 0;
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <button onClick={onBack} className="flex items-center gap-1 text-xs font-mono mb-6" style={{ color: SUBTEXT }}>
        <ChevronLeft size={13} /> back to sheet
      </button>

      <div className="text-[10px] font-mono uppercase tracking-[0.15em] mb-2" style={{ color: accent }}>
        {lesson.title}
      </div>

      <ConceptIntro concept={lesson.concept} accent={accent} />

      <TermsPanel terms={lesson.terms} accent={accent} />

      <div className="relative rounded-md border px-6 py-5 mb-8" style={{ background: SURFACE, borderColor: LINE }}>
        <TickCorners color={accent} />
        <div className="text-sm" style={{ color: TEXT }}>
          <GlossaryText text={lesson.instructions} />
        </div>
      </div>

      {/* New table form */}
      <div className="flex gap-2 mb-6">
        <input
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTable()}
          placeholder="new table name, e.g. students"
          className="flex-1 px-3 py-2 rounded border font-mono text-sm outline-none"
          style={{ background: SURFACE_2, borderColor: LINE, color: TEXT }}
        />
        <button onClick={addTable} className="px-4 py-2 rounded font-mono text-sm flex items-center gap-1.5" style={{ background: accent, color: INK }}>
          <Plus size={14} /> add table
        </button>
      </div>

      {/* Table sheets */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {tables.map((t) => (
          <div key={t.id} className="relative rounded-md border p-4" style={{ background: SURFACE, borderColor: LINE, borderStyle: "dashed" }}>
            <TickCorners color={accent} />
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-sm" style={{ color: accent }}>{t.name}</span>
              <button onClick={() => removeTable(t.id)} style={{ color: SUBTEXT }}><Trash2 size={14} /></button>
            </div>

            <div className="space-y-2">
              {t.columns.map((c) => (
                <div key={c.id} className="rounded px-2 py-2" style={{ background: SURFACE_2, border: `1px solid ${LINE}` }}>
                  <div className="flex gap-1.5 items-center">
                    <input
                      value={c.name}
                      onChange={(e) => updateColumn(t.id, c.id, { name: e.target.value })}
                      placeholder="column"
                      className="flex-1 min-w-0 px-2 py-1 rounded font-mono text-xs outline-none"
                      style={{ background: INK, border: `1px solid ${LINE}`, color: TEXT }}
                    />
                    <select
                      value={c.type}
                      onChange={(e) => updateColumn(t.id, c.id, { type: e.target.value })}
                      className="px-1 py-1 rounded font-mono text-xs outline-none"
                      style={{ background: INK, border: `1px solid ${LINE}`, color: TEXT }}
                    >
                      {COLUMN_TYPES.map((ty) => <option key={ty} value={ty}>{ty}</option>)}
                    </select>
                    <button
                      onClick={() => updateColumn(t.id, c.id, { pk: !c.pk })}
                      title="primary key"
                      className="p-1 rounded"
                      style={{ color: c.pk ? AMBER : SUBTEXT, border: `1px solid ${c.pk ? AMBER : LINE}` }}
                    >
                      <KeyRound size={12} />
                    </button>
                    <button onClick={() => removeColumn(t.id, c.id)} style={{ color: SUBTEXT }}><Trash2 size={12} /></button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Link2 size={11} style={{ color: SUBTEXT }} />
                    <select
                      value={c.fkTable}
                      onChange={(e) => updateColumn(t.id, c.id, { fkTable: e.target.value, fkColumn: "" })}
                      className="px-1 py-0.5 rounded font-mono text-[10px] outline-none"
                      style={{ background: INK, border: `1px solid ${LINE}`, color: SUBTEXT }}
                    >
                      <option value="">no reference</option>
                      {tables.filter((ot) => ot.id !== t.id).map((ot) => <option key={ot.id} value={ot.name}>{ot.name}</option>)}
                    </select>
                    {c.fkTable && (
                      <select
                        value={c.fkColumn}
                        onChange={(e) => updateColumn(t.id, c.id, { fkColumn: e.target.value })}
                        className="px-1 py-0.5 rounded font-mono text-[10px] outline-none"
                        style={{ background: INK, border: `1px solid ${LINE}`, color: SUBTEXT }}
                      >
                        <option value="">column</option>
                        {(tables.find((ot) => ot.name === c.fkTable)?.columns || []).map((oc) => (
                          <option key={oc.id} value={oc.name}>{oc.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={() => addColumn(t.id)} className="w-full text-xs font-mono py-1.5 rounded border flex items-center justify-center gap-1" style={{ borderColor: LINE, color: SUBTEXT, borderStyle: "dashed" }}>
                <Plus size={12} /> add column
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={validate} className="w-full py-3 rounded font-mono text-sm" style={{ background: accent, color: INK }}>
        check schema
      </button>

      {result && !result.ok && (
        <div className="mt-4 rounded px-4 py-3 text-sm" style={{ background: "rgba(224,102,107,0.08)", color: BAD }}>
          <div className="flex items-center gap-2 mb-1 font-mono text-xs uppercase tracking-wide"><X size={14} /> not yet</div>
          <ul className="text-xs space-y-1 mt-1">
            {result.details.map((d, i) => <li key={i}>· {d}</li>)}
          </ul>
        </div>
      )}
      {result && result.ok && (
        <div className="mt-4 rounded px-4 py-3 text-sm flex items-center justify-between" style={{ background: "rgba(95,191,127,0.08)", color: GOOD }}>
          <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide"><Check size={14} /> schema matches</span>
          <button onClick={() => onComplete(true)} className="px-4 py-1.5 rounded font-mono text-xs" style={{ background: GOOD, color: INK }}>
            finish lesson
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Root app                                                           */
/* ------------------------------------------------------------------ */
export default function App() {
  const [view, setView] = useState("dashboard"); // dashboard | track | lesson | glossary | sandbox
  const [trackId, setTrackId] = useState(null);
  const [lessonIndex, setLessonIndex] = useState(null);
  const [progress, setProgress] = useState({ js: {}, py: {}, db: {}, project: {} });
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [saveWarning, setSaveWarning] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("workbench-progress", false);
        if (res?.value) {
          const data = JSON.parse(res.value);
          setProgress(data.progress || { js: {}, py: {}, db: {}, project: {} });
          setXp(data.xp || 0);
          setStreak(data.streak || 0);
        }
      } catch (e) {
        // no saved data yet
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback(async (nextProgress, nextXp, nextStreak) => {
    try {
      const result = await window.storage.set("workbench-progress", JSON.stringify({ progress: nextProgress, xp: nextXp, streak: nextStreak }), false);
      setSaveWarning(!result);
    } catch (e) {
      setSaveWarning(true);
    }
  }, []);

  const openTrack = (id) => { setTrackId(id); setView("track"); };
  const openLesson = (i) => { setLessonIndex(i); setView("lesson"); };
  const openGlossary = () => setView("glossary");
  const openSandbox = () => setView("sandbox");
  const backToTrack = () => setView("track");
  const backToDashboard = () => setView("dashboard");

  const completeLesson = (clean) => {
    const nextProgress = { ...progress, [trackId]: { ...progress[trackId], [lessonIndex]: true } };
    const nextXp = xp + XP_PER_LESSON + (clean ? 5 : 0);
    const nextStreak = clean ? streak + 1 : 0;
    setProgress(nextProgress);
    setXp(nextXp);
    setStreak(nextStreak);
    persist(nextProgress, nextXp, nextStreak);
    setView("track");
  };

  const markTrackComplete = (id) => {
    const lessons = id === "db" ? DB_LESSONS : id === "project" ? PROJECT_LESSONS : TRACKS[id];
    const alreadyDone = Object.keys(progress[id] || {}).length;
    const newlyCompleted = lessons.length - alreadyDone;
    const allDone = {};
    lessons.forEach((_, i) => { allDone[i] = true; });
    const nextProgress = { ...progress, [id]: allDone };
    const nextXp = xp + newlyCompleted * XP_PER_LESSON;
    setProgress(nextProgress);
    setXp(nextXp);
    persist(nextProgress, nextXp, streak);
  };

  const resetTrack = (id) => {
    const nextProgress = { ...progress, [id]: {} };
    setProgress(nextProgress);
    persist(nextProgress, xp, streak);
  };

  if (!loaded) {
    return (
      <div style={{ background: INK, minHeight: "100vh" }} className="flex items-center justify-center">
        <span className="font-mono text-sm" style={{ color: SUBTEXT }}>loading workbench…</span>
      </div>
    );
  }

  const lessons = trackId === "db" ? DB_LESSONS : trackId === "project" ? PROJECT_LESSONS : trackId ? TRACKS[trackId] : null;
  const currentLesson = lessons && lessonIndex !== null ? lessons[lessonIndex] : null;
  const accent = trackId ? TRACKS_META[trackId].color : AMBER;

  return (
    <div style={{ background: INK, minHeight: "100vh", position: "relative" }} className="font-sans">
      <GridBackdrop />
      {saveWarning && (
        <div
          className="sticky top-0 z-10 px-4 py-2.5 text-xs font-mono text-center"
          style={{ background: "rgba(224,102,107,0.15)", color: BAD, borderBottom: `1px solid ${BAD}` }}
        >
          Progress isn't saving — publish this artifact (••• menu → Publish) to turn on saving between sessions.
        </div>
      )}
      <div className="relative">
        {view === "dashboard" && (
          <Dashboard progress={progress} xp={xp} streak={streak} onOpenTrack={openTrack} onOpenGlossary={openGlossary} onOpenSandbox={openSandbox} />
        )}
        {view === "glossary" && <GlossaryPage onBack={backToDashboard} />}
        {view === "sandbox" && <SandboxPage onBack={backToDashboard} />}
        {view === "track" && trackId && (
          <TrackView trackId={trackId} progress={progress} onOpenLesson={openLesson} onBack={backToDashboard} onMarkAllComplete={markTrackComplete} onResetTrack={resetTrack} />
        )}
        {view === "lesson" && currentLesson && currentLesson.kind === "schema" && (
          <SchemaLesson lesson={currentLesson} accent={accent} onComplete={completeLesson} onBack={backToTrack} />
        )}
        {view === "lesson" && currentLesson && currentLesson.kind !== "schema" && (
          <QuizLesson lesson={currentLesson} accent={accent} onComplete={completeLesson} onBack={backToTrack} />
        )}
      </div>
    </div>
  );
}
