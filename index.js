/* eslint-env jquery */

// 跳脫功能
function escape(toOutput) {
  return toOutput.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27')
    .replace(/\//g, '&#x2F')
}

// 隨機產生 token
function getToken() {
  const token = Math.random().toString(36).substring(7)
  return token
}

let id = 1
let undoneTodoCount = 0

const tempalte = `
  <li class="list-group-item {todoLiClass}">
    <span class="list__content {todoSpanClass}" id="{id}">{content}</span>
    <div class="list__btn">
      <button type="button" class="btn btn__edit">編輯</button>
      <button type="button" class="btn-close" aria-label="Close"></button> 
    </div>
  </li> `

// 增加 todo
function addTodo() {
  const value = $('.form-control').val()

  if (!value) {
    alert('沒有事情做嗎?')
    return
  }

  $('.list-group').prepend(
    tempalte
      .replace('{todoLiClass}', 'undone')
      .replace('{content}', escape(value))
      .replace(/{id}/g, id)
  )
  id += 1
  undoneTodoCount++
  updateCounter()
  $('.form-control').val('')
}

// 更新未完成總數
function updateCounter() {
  $('.undone-count').text(undoneTodoCount)
}

// 從後端取資料出來 render
function restoreTodos(todos) {
  if (todos.length === 0) return
  id = todos[todos.length - 1].id + 1

  for (let i = 0; i < todos.length; i++) {
    const todo = todos[i]
    $('.list-group').append(
      tempalte
        .replace('{content}', escape(todo.content))
        .replace(/{id}/g, id)
        .replace('{todoLiClass}', todo.isDone ? 'finished' : 'undone')
        .replace('{todoSpanClass}', todo.isDone ? 'checked' : '')
    )

    if (!todo.isDone) {
      undoneTodoCount++
    }

    updateCounter()
  }
}

$(document).ready(() => {
  // 新增
  $('.btn__send').on('click', (e) => {
    addTodo()
  })

  // 用 enter 新增
  $('.form-control').keydown((e) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  })

  // 刪除
  $('.list-group').on('click', '.btn-close', (e) => {
    const btn = $(e.currentTarget)
    btn.closest('li').remove()

    const isChecked = btn.parent('div').prev().hasClass('checked')

    if (!isChecked) {
      undoneTodoCount--
    }

    updateCounter()
  })

  // 清空
  $('.list__clear').on('click', (e) => {
    $('.list-group-item').remove()
    undoneTodoCount = 0
    updateCounter()
  })

  // 標記
  $('.list-group').on('click', '.list__content', (e) => {
    const item = $(e.currentTarget)

    if (item.hasClass('checked')) {
      item.removeClass('checked')
      item.closest('li').removeClass('finished')
      item.closest('li').addClass('undone')
      undoneTodoCount++
    } else {
      undoneTodoCount--
      item.addClass('checked')
      item.closest('li').addClass('finished')
      item.closest('li').removeClass('undone')
    }

    updateCounter()
  })

  // 編輯
  $('.list-group').on('click', '.btn__edit', (e) => {
    const edit = $(e.currentTarget)
    const spanText = edit.parent('div').prev().text()
    const editList = $('.list__edit').val()
    const content = ` 
      <input type="text" class="list__edit" value="${escape(spanText)}"/>
      <div class="list__btn">
        <button type="button" class="btn btn__edit update">完成</button>
        <button type="button" class="btn-close" aria-label="Close"></button> 
      </div>
    `

    if (edit.hasClass('update')) {
      if (!editList) {
        alert('尚未更新')
        return
      }

      const updateList = ` 
        <span class="list__content">${escape(editList)}</span>
        <div class="list__btn">
          <button type="button" class="btn btn__edit">編輯</button>
          <button type="button" class="btn-close" aria-label="Close"></button> 
        </div>
      `

      const checkedList = ` 
        <span class="list__content checked">${escape(editList)}</span>
        <div class="list__btn">
          <button type="button" class="btn btn__edit">編輯</button>
          <button type="button" class="btn-close" aria-label="Close"></button> 
        </div>
      `

      if (edit.closest('li').hasClass('finished')) {
        edit.closest('li').html(checkedList)
      } else {
        edit.closest('li').html(updateList)
      }
    }

    if (!edit.hasClass('update')) {
      edit.closest('li').html(content)
    }
  })

  // 篩選
  $('.container').on('click', (e) => {
    const total = e.target.closest('.btn__total')
    const undone = e.target.closest('.btn__undone')
    const finished = e.target.closest('.btn__finished')

    if (total) {
      $('.list-group-item').show()
    }

    if (undone) {
      if ($('.list-group-item').hasClass('undone')) {
        $('.list-group-item').hide()
        $('.undone').show()
      } else {
        $('.list-group-item').hide()
      }
    }

    if (finished) {
      if ($('.list-group-item').hasClass('finished')) {
        $('.list-group-item').hide()
        $('.finished').show()
      } else {
        $('.list-group-item').hide()
      }
    }
  })

  // 把資料變成 JSON
  $('.list__save').on('click', () => {
    const todos = []
    $('.list-group-item').each((i, element) => {
      const content = $(element).find('.list__content')
      todos.push({
        id: content.attr('id'),
        content: content.text(),
        isDone: content.hasClass('checked')
      })
    })

    const data = JSON.stringify(todos)
    $.ajax({
      type: 'POST',
      url: 'https://ywh15.tw/todo/api_add_todo.php',
      data: {
        token: getToken(),
        todo: data
      },
      success: (res) => {
        const respToken = res.token
        alert(`你的 token 代碼是 ${respToken}`)
      },
      error: () => {
        alert('Erro QQ')
      }
    })
  })

  // 輸入 token
  $('.list__token').on('click', () => {
    const input = prompt('請輸入你的 token')

    if (input) {
      $('.list-group').html('')
      undoneTodoCount = 0
      updateCounter()

      $.getJSON(`https://ywh15.tw/todo/api_get_todo.php?token=${input}`, (data) => {
        const todos = JSON.parse(data.data.todo)
        restoreTodos(todos)
      })
    }
  })
})
