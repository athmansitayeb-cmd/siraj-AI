package com.siraj.mobile.data.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

data class AskRequest(val prompt: String)
data class AskResponse(val id: String, val text: String)

interface ApiService {
    @POST("/ask")
    suspend fun ask(@Body req: AskRequest): Response<AskResponse>
}
