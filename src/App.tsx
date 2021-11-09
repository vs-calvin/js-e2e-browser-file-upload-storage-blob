// ./src/App.tsx

import React, { useState } from "react";
import styled from "styled-components";
import Path from "path";
import uploadFileToBlob, {
  isStorageConfigured,
  getBlobsInContainer2,
} from "./azure-storage-blob";

const Main = styled("div")`
  font-size: 1em;
  border: 1px solid #e5e5e5;
  display: flex;
`;

const DropDownContainer = styled("div")`
  padding: 1px 20px;
  width: 200px;
`;

const Button = styled("button")`
  font-size: 1em;
  margin-left: 20px;
  padding: 5px 20px;
  font-weight: 500;
  border: none;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.15);
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
`;

const InputLabel = styled("label")`
  padding: 5px 10px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.15);
  background: #ffffff;
`;

const DropDownHeader = styled("div")`
  padding: 5px 20px;
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

const App = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>();
  const toggling = () => setIsOpen(!isOpen);

  const onOptionClicked = (value: string) => () => {
    setSelectedOption(value);
    setIsOpen(false);
    console.log(selectedOption);
  };

  // all blobs in container
  const [blobList, setBlobList] = useState<string[]>([]);

  // current file to upload into container
  const [filesSelected, setFilesSelected] = useState<FileList>();
  //const [filesSelected, setFilesSelected] = useState([]);

  // UI/form management
  const [uploading, setUploading] = useState(false);
  const [inputKey, setInputKey] = useState(Math.random().toString(36));

  const onFileChange = (event: any) => {
    setFilesSelected(event.target.files);
  };

  const onFileUpload = async () => {
    // prepare UI
    setUploading(true);

    let files: File[] = [];
    Array.from(filesSelected as FileList).forEach((file) => files.push(file));

    let promises = files.map(async (file) => {
      await uploadFileToBlob(
        file,
        selectedOption ? selectedOption : options[0]
      );
    });
    await Promise.all(promises);

    setBlobList(
      await getBlobsInContainer2(selectedOption ? selectedOption : options[0])
    );

    setUploading(false);
    setInputKey(Math.random().toString(36));
  };

  // display form
  const DisplayForm = () => (
    <Main>
      <DropDownContainer>
        <DropDownHeader onClick={toggling}>
          {selectedOption || options[0]}
        </DropDownHeader>
        {isOpen && (
          <DropDownList>
            {options.map((option) => (
              <ListItem onClick={onOptionClicked(option)} key={Math.random()}>
                {option}
              </ListItem>
            ))}
          </DropDownList>
        )}
      </DropDownContainer>
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
      <h2>Container items</h2>
      <ul>
        {blobList.map((item) => {
          return (
            <li key={item}>
              <div>
                {Path.basename(item)}
                <br />
                <img src={item} alt={item} height="200" />
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
      {storageConfigured && blobList.length > 0 && DisplayImagesFromContainer()}
      {!storageConfigured && <div>Storage is not configured.</div>}
    </div>
  );
};

export default App;
