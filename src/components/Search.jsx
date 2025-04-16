function Search({searchTerm, setSearchTerm}){
    return(
        <div className="search">
            <div>
                <img src="search.svg" alt="search" />
            <input type="text"
            placeholder="Search your movie here..."
            value={searchTerm}
            onChange={(event)=>setSearchTerm(event.target.value)} // o que for erscrito aqui vai ser passado para variavel "searchTerm"
            />
            </div>
        </div>
    )
}
export default Search