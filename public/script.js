
// NAVIGATION
const showHideNav = () => {
    document.getElementById("nav-items").classList.toggle("hide-small");
};
const logoLink = () => {
    window.location.href= "https://ehubertt.github.io/Projects/final/final-pages/home/index.html";
}

document.getElementById("logo").onclick = logoLink;
document.getElementById("hamburger").onclick = showHideNav;


// MY BRANDS -- USER NOT ABLE TO ALTER
const getMyBrands = async () => {
    const url = "https://ehubertt.github.io/Projects/part3/brands/brands.json";

    try{
        const response = await fetch(url);
        return response.json();
    }catch(error){
        console.log(error);
    }
};

const showMyBrands = async () => {
    console.log("trying to show");
    let Mybrands = await getMyBrands();
    const brandList = document.getElementById("main-content");

    Mybrands.forEach(Mybrand => {
        brandList.append(getMyBrandSection(Mybrand));
    })
}

const getMyBrandSection = (brand) => {
    //create div for two brands to flex 
    const div = document.createElement("section");
    div.className = "brand-box";
    //create section for brand 
    const brandSection = document.createElement("section");
    brandSection.className = "brand";
    div.appendChild(brandSection);

    // create section for name inside brand section
    const name = document.createElement("section");
    name.className = "name";
    name.innerHTML = `<b>${brand.name}</b>`
    
    brandSection.appendChild(name);

    //add image section below name 
    const image = document.createElement("img");
    image.className = "images";
    image.src = `${brand.main_image}`;
    brandSection.appendChild(image);

    //add description below image 
    const description = document.createElement("p");
    description.innerHTML = `${brand.decsription}`;
    brandSection.appendChild(description);

    //add array of available products 
    const products = document.createElement("p");
    products.className = "productsList";
    products.innerHTML = `<b>Some Products offered by the brand:</b> ${brand.products.join(", ")}`;
    brandSection.appendChild(products);

    return div;
}

window.onload = () => showMyBrands();



// USER BRANDS -- ADD / EDIT / DELETE 

const getUserBrands = async () => {
    try {
        return (await fetch("api/brands/")).json();
      } catch (error) {
        console.log(error);
      }
};

const showUserBrands = async () => {
    console.log("getting user brands");
    let Userbrands = await getUserBrands();
    const brandDiv = document.getElementById("user-brand-details");
    brandDiv.innerHTML="";
    console.log(Userbrands);
    Userbrands.forEach(brand => {
        const div = document.createElement("section");
        div.className = "brand-box";
        //create section for brand 
        const brandSection = document.createElement("section");
        brandSection.className = "brand";
        div.appendChild(brandSection);

        // create section for name inside brand section
        const name = document.createElement("section");
        name.className = "name";
        name.innerHTML = `<b>${brand.name}</b>`
        const dLink = document.createElement("a");
        dLink.innerHTML = "	&#9249;";
        dLink.id = "delete-link";
        const eLink = document.createElement("a");
        eLink.innerHTML = "  &#9998;";
        name.append(eLink);
        name.append(dLink);
        eLink.id = "edit-link";
        brandSection.appendChild(name);

        //add image section below name 
        const image = document.createElement("img");
        image.className = "images";
        image.src = brand.main_image;
        brandSection.appendChild(image);

        //add description below image 
        const description = document.createElement("p");
        description.innerHTML = `${brand.description}`;
        brandSection.appendChild(description);

        //add array of available products 
        const products = document.createElement("p");
        products.className = "productsList";
        products.innerHTML = `<b>Some Products offered by the brand:</b> ${brand.products.join(", ")}`;
        brandSection.appendChild(products);
        
        const userName = document.createElement("p");
        userName.innerHTML = `<b>Submission by:</b> ${brand.userName}`;
        brandSection.appendChild(userName);
        brandDiv.appendChild(div);

        eLink.onclick = showBrandForm;
        dLink.onclick = deleteBrand.bind(this, brand);


        populateEditForm(brand);
    });

}

const populateEditForm = (brand) =>{
    const form = document.getElementById("add-brand-form");
    form._id.value = brand._id;
    form.name.value = brand.name;
    form.description.value = brand.description;
    form.userName.value = "cannot be updated";
    document.getElementById("img-prev").src = brand.main_image;
    populateProducts(brand.products);
};
  
  const populateProducts = (products) => {
    const section = document.getElementById("product-boxes");
    products.forEach((product)=>{
      const input = document.createElement("input");
      input.type = "text";
      input.value = product;
      section.append(input);
    });
};

const addEditBrand = async (e) => {
    e.preventDefault();
    const form = document.getElementById("add-brand-form");
    const formData = new FormData(form);
    let response;
    formData.append("products", getProducts());
  
    console.log(...formData);
  
    //add request
    if (form._id.value.trim() == "") {
      console.log("in post");
      response = await fetch("/api/brands", {
        method: "POST",
        body: formData,
      });
    } else {
      //put request
      console.log(form._id.value);
      console.log(`/api/brands/${form._id.value}`);
      response = await fetch(`api/brands/${form._id.value}`, {
        method: "PUT",
        body: formData,
      });
    }
  
    //successfully got data from server
    if (response.status != 200) {
      console.log("Error adding / editing data");
    }
  
    await response.json();
    resetForm();
    document.getElementById("dialog").style.display = "none";
    showUserBrands();
};

const deleteBrand = async(brand)=> {
    // Prompt the user to confirm deletion
    const confirmDelete = confirm("Are you sure you want to delete this item?");

    // If user confirms deletion
    if (confirmDelete) {
        let response = await fetch(`/api/brands/${brand._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            }
        });

        if (response.status === 200) {
            resetForm();
            showUserBrands();
            document.getElementById("dialog").style.display = "none";
        } else {
            console.log("Error deleting");
        }
    } else {
        // If user cancels deletion, do nothing
        return;
    }
};


const showBrandForm = (e) => {
    e.preventDefault();
    openDialog("add-brand-form");
    console.log(e.target);
    if (e.target.getAttribute("id") != "edit-link") {
    resetForm();
  }
};

const resetForm = () => {
    const form = document.getElementById("add-brand-form");
    form.reset();
    form._id.value = "";
    document.getElementById("product-boxes").innerHTML = "";
    document.getElementById("img-prev").src = "";
  };

const openDialog = (id) => {
    document.getElementById("dialog").style.display = "block";
    document.querySelectorAll("#dialog-details > *").forEach((item) => {
      item.classList.add("hidden");
    });
    document.getElementById(id).classList.remove("hidden");
};

const addProduct = (e) => {
    e.preventDefault();
    const section = document.getElementById("product-boxes");
    const input = document.createElement("input");
    input.classList.add("product-box");
    input.type = "text";
    section.append(input);
};

const getProducts = () => {
    const inputs = document.querySelectorAll("#product-boxes input");
    const products = [];
  
    inputs.forEach((input)=>{
        products.push(input.value);
    });
  
    return products;
}

const cancel = () => {
    resetForm();
    document.getElementById("dialog").style.display = "none";
}


// ON LOAD

showUserBrands();
document.getElementById("add-brand-form").onsubmit = addEditBrand;
document.getElementById("brand-btn").onclick = showBrandForm;
document.getElementById("add-product").onclick = addProduct;
document.getElementById("cancel").onclick = cancel;
  
  
document.getElementById("img").onchange = (e) => {
    if (!e.target.files.length) {
      document.getElementById("img-prev").src = "";
      return;
    }
    document.getElementById("img-prev").src = URL.createObjectURL(
      e.target.files.item(0)
    );
};