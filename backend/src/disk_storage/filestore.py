import shutil

import aiofiles
import shortuuid
import os
import tempfile

curr_dir_path = os.path.abspath(os.path.dirname(__file__))
write_path = os.path.abspath(os.path.join(curr_dir_path, '../..', 'static/files'))


async def uploadFile(file):
    file_uuid = shortuuid.uuid()
    file_ext = file.filename.split(".")[-1]
    contents = await file.read()

    if not os.path.exists(write_path):
        os.makedirs(write_path)

    filepath = os.path.abspath(os.path.join(write_path, file_uuid + "." + file_ext))

    async with aiofiles.open(filepath, 'wb') as f:
        await f.write(contents)

    return os.path.relpath(os.path.join(write_path, file_uuid + "." + file_ext))


async def deleteFile(file_path):
    if os.path.exists(file_path):
        os.remove(file_path)

    return True
