import React from "react";
import { Storage, Auth, API, graphqlOperation } from "aws-amplify";
// prettier-ignore
import {
  Form,
  Button,
  Input,
  Notification,
  Radio,
  Upload,
} from "element-react";

import { createProduct } from "../graphql/mutations";
import aws_exports from "../aws-exports";
import { convertDollarsToCents } from "../utils";
import "./index.css";

const initialState = {
  description: "",
  price: "",
  imagePreview: "",
  image: "",
  shipped: false,
  isUploading: false,
  percentUploaded: 0,
  dialogVisible: "",
};

class NewProduct extends React.Component {
  state = { ...initialState };

  handleAddProduct = async () => {
    const { image } = this.state;
    const imageData = image.raw;
    try {
      this.setState({ isUploading: true });
      const visibility = "public";
      const { identityId } = await Auth.currentCredentials();
      const filename = `/${visibility}/${identityId}/${Date.now()}-${
        imageData.name
      }`;
      const uploadedFile = await Storage.put(filename, imageData, {
        contentType: imageData.type,
      });
      const file = {
        key: uploadedFile.key,
        bucket: aws_exports.aws_user_files_s3_bucket,
        region: aws_exports.aws_project_region,
      };
      const input = {
        productMarketId: this.props.marketId,
        description: this.state.description,
        shipped: this.state.shipped,
        price: convertDollarsToCents(this.state.price),
        file,
      };
      await API.graphql(graphqlOperation(createProduct, { input }));
      Notification({
        title: "Success",
        message: "Product successfully created!",
        type: "success",
      });
      this.setState({ ...initialState });
    } catch (err) {
      console.error("Error adding product", err);
    }
  };

  handleChange = (file, fileList) => {
    this.setState({
      image: file,
    });
  };

  render() {
    const { description, price, image, shipped, isUploading } = this.state;

    return (
      <div className="flex-center">
        <h2 className="header">Add New Product</h2>
        <div>
          <Form className="market-header">
            <Form.Item label="Add Product Description">
              <Input
                type="text"
                icon="information"
                placeholder="Description"
                value={description}
                onChange={(description) => this.setState({ description })}
              />
            </Form.Item>
            <Form.Item label="Set Product Price">
              <Input
                type="number"
                icon="plus"
                placeholder="Price ($USD)"
                value={price}
                onChange={(price) => this.setState({ price })}
              />
            </Form.Item>
            <Form.Item label="Is the Product Shipped or Emailed to the Customer?">
              <div className="text-center">
                <Radio
                  value="true"
                  checked={shipped === true}
                  onChange={() => this.setState({ shipped: true })}
                >
                  Shipped
                </Radio>
                <Radio
                  value="false"
                  checked={shipped === false}
                  onChange={() => this.setState({ shipped: false })}
                >
                  Emailed
                </Radio>
              </div>
            </Form.Item>
            <div className="upload-image-container">
              <p>Add Photo </p>
              <div className="el-upload el-upload--picture-card">
                <Upload
                  className="upload-demo"
                  action=""
                  showFileList={false}
                  onChange={(file, fileList) =>
                    this.handleChange(file, fileList)
                  }
                >
                  {image ? (
                    <img
                      src={image.url}
                      className="avatar-preview"
                      alt="preview"
                    />
                  ) : (
                    <i className="el-icon-plus avatar-uploader-icon"></i>
                  )}
                </Upload>
              </div>
            </div>
            <Form.Item>
              <Button
                disabled={!image || !description || !price || isUploading}
                type="primary"
                onClick={this.handleAddProduct}
                loading={isUploading}
              >
                {isUploading ? "Uploading..." : "Add Product"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  }
}

export default NewProduct;
