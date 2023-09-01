

const AddEditForm = (props) => {

    return (
        <>  
            <div className='form-title'>
                <h2>{props.title}</h2>
            </div>
            <div className="form-container">
                
                <form onSubmit={props.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">إسم المستخدم :</label>
                        <input type="text" id="username" value={props.username} onChange={e => props.setUsername(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">كلمة السر :</label>
                        <input type="password" id="password" value={props.password} onChange={e => props.setPassword(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">دور المستخدم : </label>
                        <select id="role" value={props.role} onChange={e => props.setRole(e.target.value)} required>
                            <option value="User">مستخدم</option>
                            <option value="Manager">مدير</option>
                            <option value="Admin">أدمن النظم</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="group">القسم المنتمي إليه :</label>
                        <select id="group" value={props.group} onChange={e => props.setGroup(e.target.value)} >
                            <option value="">-- أختر القسم --</option>
                            {props.groups?.map((group, index)=>
                            (
                             <option  key={index}  value={group.id}>{group.name}</option>
                            ))}

                        </select>
                    </div>
                    <button type="submit">إضافة مستخدم جديد</button>
                    {props.error && <div className="alert alert-primary pop" role="alert">
                        {props.error}
                    </div>
                    }
                </form>
            </div>
        </>
    )
}

export default AddEditForm