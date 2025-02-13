/********************************************************************************
 * Copyright (c) 2017-2018 TypeFox and others.
 * Modifications: (c) 2023 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
// based on: https://github.com/eclipse-sprotty/sprotty-theia/blob/v0.12.0/src/sprotty/theia-file-saver.ts
import { ExportSvgAction } from '@eclipse-glsp/client';
import { MessageService } from '@theia/core/lib/common';
import URI from '@theia/core/lib/common/uri';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { inject, injectable } from 'inversify';

@injectable()
export class TheiaFileSaver {
    @inject(FileService) protected readonly fileService: FileService;
    @inject(MessageService) protected readonly messageService: MessageService;

    save(sourceUri: string, action: ExportSvgAction): void {
        this.getNextFileName(sourceUri).then(fileName => {
            this.fileService
                .write(new URI(fileName), action.svg)
                .then(() => this.messageService.info(`Diagram exported to '${fileName}'`))
                .catch(error => this.messageService.error(`Error exporting diagram '${error}`));
        });
    }

    getNextFileName(sourceUri: string): Promise<string> {
        return new Promise<string>(resolve => this.tryNextFileName(sourceUri, 0, resolve));
    }

    tryNextFileName(sourceURI: string, count: number, resolve: (fileName: string) => void): void {
        const currentName = sourceURI + (count === 0 ? '' : count) + '.svg';
        this.fileService.exists(new URI(currentName)).then(exists => {
            if (!exists) {
                resolve(currentName);
            } else {
                this.tryNextFileName(sourceURI, ++count, resolve);
            }
        });
    }
}
