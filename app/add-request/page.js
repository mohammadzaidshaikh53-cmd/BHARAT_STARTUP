"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AddRequest() {

  const [form, setForm] = useState({
    title: "",
    category: "",
    location: "",
    budget: "",
    whatsapp: ""
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { error } = await supabase
      .from("requests")
      .insert([form])

    if (error) {
      alert("Error saving request")
      console.log(error)
    } else {
      alert("Request posted!")
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Post Requirement</h2>

      <form onSubmit={handleSubmit}>
        <input name="title" value={form.title} onChange={handleChange} placeholder="What do you need?" /><br/><br/>
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category" /><br/><br/>
        <input name="location" value={form.location} onChange={handleChange} placeholder="Location" /><br/><br/>
        <input name="budget" value={form.budget} onChange={handleChange} placeholder="Budget" /><br/><br/>
        <input name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="WhatsApp" /><br/><br/>

        <button type="submit">Post Request</button>
      </form>
    </div>
  )
}