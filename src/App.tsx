// ./src/App.tsx

import React, { useState } from "react";
import styled from "styled-components";
//import Path from "path";

import uploadFileToBlob, {
  isStorageConfigured,
  getBlobsInContainer,
  createContainers,
} from "./azure-storage-blob";

const Main = styled("div")`
  font-size: 1em;
  border: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
`;

const Button = styled("button")`
  margin: 2px 10px;
  padding: 5px 20px;
  width: 200px;
  font-size: 1em;
  font-weight: 500;
  border: none;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.15);
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
`;

const InputLabel = styled("label")`
  margin: 2px 10px;
  padding: 5px 20px;
  width: 200px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.15);
  background: #ffffff;
`;

const DropDownHeader = styled("div")`
  margin: 2px 10px;
  padding: 5px 20px;
  width: 200px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.15);
  background: #ffffff;
`;

const DropDownList = styled("ul")`
  padding: 8px 0px;
  width: 200px;
  position: absolute;
  background-color: #f9f9f9;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  margin: 0;
  background: #ffffff;
  border: 2px solid #e5e5e5;
  box-sizing: border-box;
  &:first-child {
    padding-top: 0.8em;
  }
`;

const ListItem = styled("li")`
  padding: 0px 20px;
  list-style: none;
  z-index: 1;
  margin-bottom: 0.8em;
`;

const storageConfigured = isStorageConfigured();
const options = [
  "user-profiles",
  "small-tile-images",
  "big-tile-images",
  "preview-images",
];
createContainers(options);

const App = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("user-profiles");
  const toggling = () => setIsOpen(!isOpen);

  const onOptionClicked = (value: string) => async () => {
    setSelectedOption(value);
    setIsOpen(false);

    // update container image list
    setBlobList(await getBlobsInContainer(value));
  };

  const [blobList, setBlobList] = useState<string[]>([]);
  const [filesSelected, setFilesSelected] = useState<File[]>([]);
  // UI/form management
  const [uploading, setUploading] = useState(false);
  const [inputKey, setInputKey] = useState(Math.random().toString(36));

  const onFileChange = (event: any) => {
    let files: File[] = [];
    Array.from(event.target.files as FileList).forEach((file) =>
      files.push(file)
    );

    setFilesSelected(files);
  };

  const onFileUpload = async () => {
    // prepare UI
    setUploading(true);

    let promises = filesSelected.map(async (file) => {
      await uploadFileToBlob(
        file,
        selectedOption ? selectedOption : options[0]
      );
    });
    await Promise.all(promises);

    setBlobList(
      await getBlobsInContainer(selectedOption ? selectedOption : options[0])
    );

    setUploading(false);
    setInputKey(Math.random().toString(36));
  };

  // display form
  const DisplayForm = () => (
    <Main>
      <DropDownHeader onClick={toggling}>{selectedOption}</DropDownHeader>
      {isOpen && (
        <DropDownList>
          {options.map((option) => (
            <ListItem onClick={onOptionClicked(option)} key={Math.random()}>
              {option}
            </ListItem>
          ))}
        </DropDownList>
      )}
      <input
        type="file"
        multiple
        id="upload"
        hidden
        onChange={onFileChange}
        key={inputKey || ""}
      />
      <InputLabel htmlFor="upload">Choose file</InputLabel>

      <Button type="submit" onClick={onFileUpload}>
        Upload!
      </Button>
    </Main>
  );

  // display file name and image
  const DisplayImagesFromContainer = () => (
    <Main>
      <h2>{selectedOption} items</h2>
      <ul>
        {blobList.map((item) => {
          return (
            <li key={item}>
              <div>
                {item}
                <br />
                <img src={item} alt={item} height="100" />
              </div>
            </li>
          );
        })}
      </ul>
    </Main>
  );

  return (
    <div>
      <h1>Versus Data Uploader</h1>
      {storageConfigured && !uploading && DisplayForm()}
      {storageConfigured && uploading && <div>Uploading</div>}
      <hr />
      {storageConfigured && DisplayImagesFromContainer()}
      {!storageConfigured && <div>Storage is not configured.</div>}
    </div>
  );
};

export default App;
