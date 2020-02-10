import arg from "arg";
import chalk from "chalk";
import launchFileInNewTerminal from "./file";
import command from "./command";
import normalize from "./normalize";

export type InitialOptions = {
  env: Record<string, string>;
  splitDirection: string | undefined;
  split: boolean | undefined;
  terminalApp: string | undefined;
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../package.json");

export const error = (message: string): string => {
  console.error(chalk`{red ERROR:} ${message}`);
  process.exit(1);
};

const args = arg(
  {
    // Types
    "--file": [String],
    "--help": Boolean,
    "--version": Boolean,
    "--split-horizontally": Boolean,
    "--split-vertically": Boolean,
    "--terminalApp": String,

    // Aliases
    "-v": "--version",
    "-h": "--help",
    "--split": "--split-vertically"
  },
  { permissive: false, argv: process.argv.slice(2) }
);

const help = chalk`
  {bold.magenta newsh} - Running files/scripts in a new shell
  
  {bold USAGE}
    {bold $} {cyan newsh} "npx jest --watch" && yarn start
    {bold $} {cyan newsh} --file path/to/script
    {bold $} {cyan newsh} --split "npx jest --watch"
    {bold $} {cyan newsh} --split-horizontally "npx tsc --watch"
    {bold $} {cyan newsh} --help
    {bold $} {cyan newsh} --version
  
  {bold OPTIONS}
    -h, --help              Shows this help message
    -v, --version           Displays the current version of newsh
  
    --split-vertically      Split the screen vertically instead of opening a new one (iTerm2 & tmux only)
    --split-horizontally    Split the screen horizontally instead of opening a new one (iTerm2 & tmux only)
    --split                 Alias for --split-vertically
    --terminalApp           Choose a specific terminal app to use (e.g. iTerm.app)
`;

if (args["--help"]) {
  console.log(help);
  process.exit(0);
}

if (args["--version"]) {
  console.log(pkg.version);
  process.exit(0);
}

const files = args["--file"];
const scripts = args._;

if ((!files || files?.length === 0) && (!scripts || scripts?.length === 0)) {
  error("please provide a file/command to run");
}

const splitDirection = args["--split-vertically"]
  ? "vertically"
  : args["--split-horizontally"]
  ? "horizontally"
  : undefined;

const cliOptions: InitialOptions = {
  env: {},
  split: !!splitDirection,
  splitDirection,
  terminalApp: args["--terminalApp"]
};

const options = normalize(cliOptions);

scripts?.forEach(script => command(script, options));
files?.forEach(filePath => launchFileInNewTerminal(filePath, options));
