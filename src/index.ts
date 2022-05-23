import { subtask } from "hardhat/config";
import { HardhatPluginError } from "hardhat/plugins";
import fs from "fs";
import { exec, ExecException } from "child_process";
import path from "path"
import {TASK_STARKNET_COMPILE_COMPILE} from "@playmint/hardhat-starknet-compile";

type CompileJob = {
    source: string;
    artifactPath: string;
    abiPath: string;
}

// compile files
subtask(TASK_STARKNET_COMPILE_COMPILE)
    .setAction(async (args: { compileJobs: CompileJob[] }, hre, runSuper) => {
        await runSuper();

        let promises = [];
        let promiseErrors: ExecException[] = [];

        // loop over sources and create a promise for each
        for (const compileJob of args.compileJobs) {
            const outDir = path.dirname(compileJob.artifactPath);
            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true });
            }

            const hintsPath = compileJob.abiPath.replace('_abi.json', '_hints.json');

            promises.push(new Promise<string>(async (resolve, reject) => {
                exec(`compile-cairo-type-hints -i ${compileJob.source} -o ${hintsPath}`,
                    (error, stdout) => {
                        if (error) {
                            // the hints can still be created even when compilation fails
                            if (fs.existsSync(hintsPath)) {
                                fs.rmSync(hintsPath);
                            }
                            reject(error);
                            return
                        }
                        resolve(stdout);
                    });
            }).catch((err) => {
                promiseErrors.push(err);
            }));
        }

        // wait for everything to finish
        await Promise.all(promises);

        // Report successes
        const successfulCount = args.compileJobs.length - promiseErrors.length;
        if (successfulCount > 0) {
            console.log(`Compiled ${successfulCount} Cairo hint ${successfulCount > 1 ? "files" : "file"} successfully`);
        }

        // Report errors
        if (promiseErrors.length > 0) {
            console.log(`${promiseErrors.length} ${promiseErrors.length > 1 ? "errors" : "error"}`);

            let errorString = "";
            for (const err of promiseErrors) {
                // remove the "command failed etc" line, we already know that
                let msgRows = err.message.split("\n");
                if (msgRows[0].startsWith("Command failed: python cairo-type-hints/console.py ")) {
                    msgRows = msgRows.slice(1);
                }

                // the rest of the lines should give the user the file and line number etc
                errorString += msgRows.join("\n") + "\n";
            }

            throw new HardhatPluginError("hardhat-cairo-type-hints", "compilation of cairo type hints failed: \n" + errorString);
        }
    });
