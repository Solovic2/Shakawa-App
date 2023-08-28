import Button from "./Button"
import "./Table.css"
const Table = (props) => {
    return (
        <>

            <div className='contolePanel'>

                <table className="table table-striped table-bordered" >
                    <thead className="thead-dark">
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">اسم المستخدم</th>
                            <th scope="col">دور المستخدم</th>
                            <th scope="col">العمليات</th>
                        </tr>
                    </thead>

                    <tbody >

                        {props.users?.map((user, index) => {
                            return (
                                <tr key={index}>
                                    <th>{user.id}</th>
                                    <th>{user.username}</th>
                                    <th>{user.role}</th>
                                    <th>
                                        <div>
                                            <Button className = "btn btn-success"  handleClick = {() => props.handleEdit(user.id)} body = "تعديل المستخدم" />
                                            <Button className = "btn btn-danger"  handleClick = {() => props.handleDelete(user.id)} body = "مسح المستخدم" />
                                        </div>
                                    </th>
                                </tr>

                            )
                        })}
                    </tbody>


                </table>
            </div >


        </>
    )
}

export default Table