package com.cuisto.cuisto.UI;

import android.app.Activity;
import android.app.Dialog;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.widget.Button;

import com.cuisto.cuisto.R;

public class DialogOublie extends Dialog implements View.OnClickListener {
    public Activity c;
    public Dialog d;
    public Button ok;

    public DialogOublie(Activity a) {
        super(a);
        this.c = a;
    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.dialog_email);
        ok = (Button) findViewById(R.id.btn_dialogOk);
        ok.setOnClickListener(this);

    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.btn_dialogOk:
                c.finish();
                break;
            default:

                break;
        }
        dismiss();
    }
}
