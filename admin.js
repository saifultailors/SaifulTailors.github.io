const SUPABASE_URL='https://uybpqqmsihbnxdpyexdv.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YnBxcW1zaWhibnhkcHlleGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNjU5NzcsImV4cCI6MjEwNTc0MTk3N30.6p9QA_l2rpx8_Ni4ToSyr8hveoSULWKaXjornXE_Cu8';
const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const loginBox=document.getElementById("loginBox");
const adminBox=document.getElementById("adminBox");
const loginMsg=document.getElementById("loginMsg");
const formMsg=document.getElementById("formMsg");
const form=document.getElementById("productForm");
const list=document.getElementById("list");
let editingId=null;
let editingImageUrl=null;

function msg(el,text,error=false){el.textContent=text;el.style.color=error?"#a11":"#176b3a";}

async function checkSession(){
  const {data}=await client.auth.getSession();
  showState(data.session);
}

function showState(session){
  loginBox.classList.toggle("hidden",!!session);
  adminBox.classList.toggle("hidden",!session);
  if(session) loadProducts();
}

document.getElementById("loginBtn").onclick=async()=>{
  msg(loginMsg,"লগইন হচ্ছে...");
  const email=document.getElementById("email").value.trim();
  const password=document.getElementById("password").value;
  const {data,error}=await client.auth.signInWithPassword({email,password});
  if(error){msg(loginMsg,error.message,true);return;}
  msg(loginMsg,"");
  showState(data.session);
};

document.getElementById("logoutBtn").onclick=async()=>{
  await client.auth.signOut(); showState(null);
};

document.getElementById("image").onchange=(e)=>{
  const f=e.target.files[0];
  const p=document.getElementById("preview"); p.innerHTML="";
  if(f){const img=document.createElement("img");img.src=URL.createObjectURL(f);p.appendChild(img);}
};

function resetForm(){
  form.reset(); editingId=null; editingImageUrl=null;
  document.getElementById("formTitle").textContent="নতুন পণ্য যোগ করুন";
  document.getElementById("saveBtn").textContent="Publish";
  document.getElementById("cancelBtn").classList.add("hidden");
  document.getElementById("preview").innerHTML="";
  msg(formMsg,"");
}

document.getElementById("cancelBtn").onclick=resetForm;

form.onsubmit=async(e)=>{
  e.preventDefault(); msg(formMsg,"সংরক্ষণ হচ্ছে...");
  const name=document.getElementById("name").value.trim();
  const price=Number(document.getElementById("price").value);
  const description=document.getElementById("description").value.trim();
  const file=document.getElementById("image").files[0];
  let image_url=editingImageUrl;

  try{
    if(!name || !Number.isFinite(price)) throw new Error("নাম ও সঠিক দাম দিন।");
    if(file){
      if(file.size>8*1024*1024) throw new Error("ছবির আকার 8MB-এর মধ্যে রাখুন।");
      const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"");
      const path=`${crypto.randomUUID()}.${ext||"jpg"}`;
      const up=await client.storage.from("products").upload(path,file,{upsert:false,contentType:file.type});
      if(up.error) throw up.error;
      image_url=client.storage.from("products").getPublicUrl(path).data.publicUrl;
    }
    if(!image_url) throw new Error("ছবি নির্বাচন করুন।");

    if(editingId){
      const {error}=await client.from("products").update({name,price,description,image_url}).eq("id",editingId);
      if(error) throw error;
    } else {
      const {error}=await client.from("products").insert({name,price,description,image_url});
      if(error) throw error;
    }
    msg(formMsg,editingId?"পণ্য আপডেট হয়েছে।":"পণ্য Publish হয়েছে।");
    resetForm(); await loadProducts();
  }catch(err){console.error(err);msg(formMsg,err.message||String(err),true);}
};

async function loadProducts(){
  list.textContent="লোড হচ্ছে...";
  const {data,error}=await client.from("products").select("*").order("created_at",{ascending:false});
  if(error){msg(list,error.message,true);return;}
  list.innerHTML="";
  if(!data.length){list.textContent="কোনো পণ্য নেই।";return;}
  data.forEach(p=>{
    const row=document.createElement("div");row.className="item";
    const img=document.createElement("img");img.src=p.image_url||"";img.alt=p.name||"";
    const meta=document.createElement("div");meta.className="meta";
    const h=document.createElement("h3");h.textContent=p.name;
    const pr=document.createElement("div");pr.className="price";pr.textContent="৳ "+Number(p.price).toLocaleString("bn-BD");
    const d=document.createElement("div");d.textContent=p.description||"";
    meta.append(h,pr,d);
    const actions=document.createElement("div");
    const edit=document.createElement("button");edit.textContent="Edit";edit.onclick=()=>editProduct(p);
    const del=document.createElement("button");del.textContent="Delete";del.className="danger";del.onclick=()=>deleteProduct(p);
    actions.append(edit,del);row.append(img,meta,actions);list.appendChild(row);
  });
}

function editProduct(p){
  editingId=p.id;editingImageUrl=p.image_url||null;
  document.getElementById("name").value=p.name||"";
  document.getElementById("price").value=p.price||0;
  document.getElementById("description").value=p.description||"";
  document.getElementById("formTitle").textContent="পণ্য পরিবর্তন করুন";
  document.getElementById("saveBtn").textContent="Update";
  document.getElementById("cancelBtn").classList.remove("hidden");
  const preview=document.getElementById("preview");preview.innerHTML="";
  if(p.image_url){const img=document.createElement("img");img.src=p.image_url;preview.appendChild(img);}
  window.scrollTo({top:0,behavior:"smooth"});
}

async function deleteProduct(p){
  if(!confirm(`"${p.name}" মুছে ফেলবেন?`)) return;
  const {error}=await client.from("products").delete().eq("id",p.id);
  if(error){alert(error.message);return;}
  await loadProducts();
}

client.auth.onAuthStateChange((_event,session)=>showState(session));
checkSession();
