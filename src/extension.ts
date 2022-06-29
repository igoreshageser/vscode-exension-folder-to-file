import * as path from 'path';
import * as vscode from 'vscode';

const createIndexFileName = (ext: string): string => `index${ext}`;

const tryTo = async (
  fn: () => Thenable<any>,
  errorMessage: string
): Promise<void> => {
  try {
    await fn();
  } catch (e) {
    const error = JSON.stringify(e);
    await vscode.window.showErrorMessage(`${errorMessage}; ${error}`);

    throw new Error(`file-to-folder error; ${error}`);
  }
};

async function convertHandler(ctx: any): Promise<void> {
  const convertationFilePath = ctx.fsPath;

  if (!convertationFilePath) {
    throw new Error('Cannot find file path');
  }

  const { dir, ext, name } = path.parse(convertationFilePath);

  const destFolderName = path.join(dir, name);
  const destFolderUri = vscode.Uri.file(destFolderName);

  await tryTo(
    () => vscode.workspace.fs.createDirectory(destFolderUri),
    `Cannot create new folder ${destFolderUri}`
  );

  const fileUri = vscode.Uri.file(convertationFilePath);

  await tryTo(
    () =>
      vscode.workspace.fs.copy(
        fileUri,
        vscode.Uri.joinPath(destFolderUri, createIndexFileName(ext))
      ),
    `Cannot create index${ext} file`
  );

  await tryTo(
    () => vscode.workspace.fs.delete(fileUri),
    `Cannot delete converatation file ${fileUri}`
  );
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'file-to-folder.convert',
    (ctx) => convertHandler(ctx)
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
