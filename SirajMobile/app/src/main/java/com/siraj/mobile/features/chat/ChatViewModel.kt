package com.siraj.mobile.features.chat

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.siraj.mobile.data.network.ApiService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

class ChatViewModel @Inject constructor(
    private val api: ApiService
) : ViewModel() {

    private val _messages = MutableStateFlow<List<String>>(emptyList())
    val messages: StateFlow<List<String>> = _messages

    fun send(prompt: String) {
        viewModelScope.launch {
            try {
                val resp = api.ask(com.siraj.mobile.data.network.AskRequest(prompt))
                if (resp.isSuccessful) {
                    resp.body()?.let {
                        _messages.value = _messages.value + it.text
                    }
                } else {
                    _messages.value = _messages.value + "Error: ${resp.code()}"
                }
            } catch (ex: Exception) {
                _messages.value = _messages.value + "Exception: ${ex.message}"
            }
        }
    }
}
