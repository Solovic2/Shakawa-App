

const AddEditGroup = (props) => {

    return (
        <>  
            <div className='form-title'>
                <h2>{props.title}</h2>
            </div>
            <div className="form-container">
                
                <form onSubmit={props.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">إسم القسم :</label>
                        <input type="text" id="username" value={props.groupName} onChange={e => props.setGroupName(e.target.value)} required onInvalid={e => e.target.setCustomValidity('برجاء إدخال إسم القسم')} />
                    </div>
                    <button type="submit">{props.title}</button>
                    {props.error && <div className="alert alert-primary pop" role="alert">
                        {props.error}
                    </div>
                    }
                </form>
            </div>
        </>
    )
}

export default AddEditGroup