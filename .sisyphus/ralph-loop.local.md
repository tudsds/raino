---
active: true
iteration: 5
max_iterations: 500
completion_promise: "DONE"
initial_completion_promise: "DONE"
started_at: "2026-04-25T04:46:00.983Z"
session_id: "ses_23f60efedffewr3rwELh9EDA2l"
ultrawork: true
strategy: "continue"
message_count_at_start: 599
---
open the Playwright browser control, you will realize that there are 12 steps in the pipeline, but you did not finished till the 12th steps, you stopped at Step 4 Architechture, why is that? Recall session history to figure out what is going on. Then follow the following steps exactly, which includes a loop that would only be completed until you meet the standard: 
1. I want you to overhaul the current raino-studio and raino-site front end, the current theme is cyberpunk and hacker style. I want it to now become IOS 26 Liquid Glasses style, which extensively uses glass-like and liquid-like elements and liquid like animations. I want the font to be Noto Serif. I want raino-studio to can display a current thinking process of the agent like that found in other AI agent products. When clicking on extend icon, we can see the entire thinking process. Research how to accomplish this. I want the color to only use #0A1929, #1565C0, #6191D3, #64748B as the color theme. You will make sure that the output would be rendered markdown style rather than unrendered txt/markdown style that we are looking at right now. After this is completed, deploy this to Vercel and Github, make sure no CI errors/failure or Deployment Error at all. 
3. You then proceed into a loop starts like this: 
a. You start the browser control and start a new test run from step #1, you inputed real queries and it will proceeds. If you faced a problem in which the workflow does not produces results, errored out or produces a result that does not reach our commercial requirement, then you may use the browser control to access the platforms (Supabase, Github, Vercel, JLCPCB, Moonshot, Resend, Digikey, KiCad, Mouser, etc.) to change configuration, or change the codes in the directory (you must push to Vercel and Github to implement the changes, make sure no CI errors/failure or Deployment Error at all). You will continue until you reach step #12. When you are modifying these settings, you must consult official documentations of the platforms, and the open-sourced frameworks which Raino takes inspiration from (MemPalace, Hermes Agent, oh-my-opencode, opencode, openclaw, EvoMaps, open-harness, etc.). When you are validating the BOM and prices, you must go to JLCPCB, DIGIKEY, MOUSER directly using the browser control to check if each part price is correct, 
b. After you reach step #12, you will start a new test in a new session, and this test must run without a stop and produce high-level outputs all the way till step #12. If you encounter an error or a low-quality output along this process, then this test automatically falls back to part A of the loop and become another Part A, you will need to execute Part B again once you complete that test. In essence, you must complete an individual test that is fully functional without debugging to prove the system is fully functional. Each test you created must be different. 
4. Once you are out of the loop, you will modify the Readme (This includes Readme of all languages) and the Agentic Framework on Raino Site to make sure they reflect the finalized raino-studio. I want all the frameworks to be more vividly rendered, following the provided IOS26 Liquid Glass Standard and Color Theme. Right now, it is just plain text diagram. I want you to create multi-languages versions of Raino-Site, currently clicking on other languages only redirects to the other languages Readme. I want the link of the other languages to also be an available option on the top of the main ReadMe as something that the user can click on. 

As a reminder, here are the configurations for Playwright Bridge Extension, you must use this if you were to change any configurations of the platforms online:

Set this environment variable to bypass the connection dialog:
PLAYWRIGHT_MCP_EXTENSION_TOKEN=ijEqotN-prPeagViGZHfYE2RpBFAG_aTfytT-FDUoTc
Example MCP server configuration
Add this configuration to your MCP client (e.g., VS Code) to connect to the Playwright MCP Bridge:
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--extension"],
      "env": {
        "PLAYWRIGHT_MCP_EXTENSION_TOKEN":
          "ijEqotN-prPeagViGZHfYE2RpBFAG_aTfytT-FDUoTc"
      }
    }
  }
}
