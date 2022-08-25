import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Typography, Form, Input } from "antd";
import EditableCell from "../Utils/EditableCell";

const originData = [];

const DataGrid = () => {
  let [data, setData] = useState(originData);
  const [keyForEdit, setKeyForEdit] = useState("");
  const [search, setSearch] = useState("");
  const [selectedData, setSelectedData] = useState([]);

  const [form] = Form.useForm();

  const filteredData = data.filter((item) => {
    return Object.keys(item).some((key) =>
      item[key].toLowerCase().includes(search)
    );
  });

  data = data && filteredData;

  const fetchUsers = async () => {
    const res = await axios.get(
      "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
    );
    const data = res.data.map((item) => {
      return {
        key: item.id,
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role,
      };
    });
    setData(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const removeById = (id) => {
    data = data.filter((item) => item.id !== id);
    setData(data);
  };

  const removeSelected = () => {
    const idList = selectedData.map((item) => item.id);
    data = data.filter((item) => !idList.includes(item.id));
    setData(data);
    setSelectedData([]);
  };

  const isEditing = (record) => record.key === keyForEdit;

  const edit = (record) => {
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      role: record.role,
    });
    setKeyForEdit(record.key);
  };

  const cancel = () => {
    setKeyForEdit("");
  };

  const save = async (key) => {
    const row = await form.validateFields();
    const newData = [...data];
    const index = newData.findIndex((item) => key === item.key);

    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, { ...item, ...row });
      setData(newData);
      setKeyForEdit("");
    } else {
      newData.push(row);
      setData(newData);
      setKeyForEdit("");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      editable: true,
      // width: "10%",
    },
    {
      title: "Email",
      dataIndex: "email",
      editable: true,
    },
    {
      title: "Role",
      dataIndex: "role",
      editable: true,
    },
    {
      title: "Actions",
      render: (_, record) => {
        const editable = isEditing(record);
        return (
          <>
            {editable ? (
              <span>
                <a
                  href="/#"
                  onClick={() => save(record.key)}
                  style={{
                    marginRight: 10,
                  }}
                >
                  Save
                </a>

                <a
                  href="/#"
                  onClick={cancel}
                  style={{
                    marginRight: 10,
                  }}
                >
                  Cancel
                </a>
              </span>
            ) : (
              <Typography.Link
                disabled={keyForEdit !== ""}
                onClick={() => edit(record)}
              >
                Edit &nbsp;&nbsp;
              </Typography.Link>
            )}

            <Typography.Link
              disabled={keyForEdit !== ""}
              onClick={() => removeById(record.id)}
            >
              Delete
            </Typography.Link>
          </>
        );
      },
    },
  ];

  const mergedColumns = columns.map((column) => {
    if (!column.editable) {
      return column;
    }
    return {
      ...column,
      onCell: (record) => ({
        record,
        inputType: "text",
        dataIndex: column.dataIndex,
        title: column.title,
        editing: isEditing(record),
      }),
    };
  });

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedData(selectedRows);
    },
  };

  const onSearch = (e) => {
    const searchText = e.target.value;
    setSearch(searchText);
  };

  return (
    <>
      <Input placeholder="Search by name, email or role" onChange={onSearch} />
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          rowSelection={{
            ...rowSelection,
          }}
          size="small"
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
          }}
        />
      </Form>
      {selectedData.length > 0 && (
        <Button
          type="primary"
          onClick={() => removeSelected()}
          danger
          style={{
            borderRadius: "25px",
            marginLeft: "5%",
            marginBottom: "5%",
          }}
        >
          Delete Selected
        </Button>
      )}
    </>
  );
};

export default DataGrid;
