Describe "GET HTTPS" {
    $response = Invoke-WebRequest -Uri 'https://webstores2tzwqtespjxscxw.z8.web.core.windows.net/'
    
    It "returns HTTP status 200" {
        $response.StatusCode | Should -Be 200
    }
}

Describe "GET HTTP" {
    $response = Invoke-WebRequest -Uri 'http://webstores2tzwqtespjxscxw.z8.web.core.windows.net/' `
                -SkipHttpErrorCheck
    
    It "does not return HTTP status 200" {
        $response.StatusCode | Should -Not -Be 200
    }
}
