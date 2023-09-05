
import Button from "../CommonComponents/Button";
import "./Table.css";
const Table = (props) => {
  return (
    <>
      <div className="contolePanel">
        <div className="add-content">
          {props.users ? (
            <Button
              handleClick={() => props.handleClick("/control-panel-admin/add")}
              className="btn btn-primary"
              body="إضافة مستخدم جديد"
            />
          ) : (
            <Button
              handleClick={() =>
                props.handleClick("/control-panel-admin/groups/add")
              }
              className="btn btn-primary"
              body="إضافة قسم جديد"
            />
          )}
        </div>

        <table className="table table-striped table-bordered">
          <thead className="thead-dark">
            {props.users ? (
              <tr>
                <th scope="col">#</th>
                <th scope="col">اسم المستخدم</th>
                <th scope="col">دور المستخدم</th>
                <th scope="col">القسم المنتمي إليه</th>
                <th scope="col">العمليات</th>
              </tr>
            ) : (
              <tr>
                <th scope="col">#</th>
                <th scope="col">اسم القسم</th>
                <th scope="col">العمليات</th>
              </tr>
            )}
          </thead>

          <tbody>
            {props.users?.map((user) => {
              let role = "مستخدم";
              switch (user.role) {
                case "Admin":
                  role = "أدمن";
                  break;
                case "Manager":
                  role = "مدير";
                  break;
                case "User":
                  role = "مستخدم";
                  break;
                default: role = "مستخدم";
                break;
              }
              return (
                <tr key={user.id}>
                  <th>{user.id}</th>
                  <th>{user.username}</th>
                  <th>{role}</th>
                  <th>{user.group ? user.group.name : "لا ينتمي لقسم معين"}</th>
                  <th>
                    <div>
                      <Button
                        className="btn btn-success"
                        handleClick={() => props.handleEdit(user.id)}
                        body="تعديل المستخدم"
                      />
                      <Button
                        className="btn btn-danger"
                        handleClick={() => props.handleDelete(user.id)}
                        body="مسح المستخدم"
                      />
                    </div>
                  </th>
                </tr>
              );
            })}
            {props.groups?.map((group) => {
              return (
                <tr key={group.id}>
                  <th>{group.id}</th>
                  <th>{group.name}</th>
                  <th>
                    <div>
                      <Button
                        className="btn btn-success"
                        handleClick={() => props.handleEdit(group.id)}
                        body="تعديل القسم"
                      />
                      <Button
                        className="btn btn-danger"
                        handleClick={() => props.handleDelete(group.id)}
                        body="مسح القسم"
                      />
                    </div>
                  </th>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Table;
